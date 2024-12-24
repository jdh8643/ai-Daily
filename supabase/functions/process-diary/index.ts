import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { content, user_id } = await req.json()
    
    if (!content || !user_id) {
      throw new Error('Content and user_id are required')
    }
    
    console.log('Processing diary entry:', { content, user_id })
    
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: '사용자의 일기에 대해 20자 이내로 짧고 긍정적인 한마디를 해주세요.'
          },
          {
            role: 'user',
            content: content
          }
        ],
        max_tokens: 50,
        temperature: 0.5,
      }),
    })

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.text()
      console.error('OpenAI API error:', errorData)
      throw new Error(`OpenAI API 오류가 발생했습니다: ${errorData}`)
    }

    const data = await openAIResponse.json()
    console.log('OpenAI API response:', data)

    if (!data.choices?.[0]?.message?.content) {
      console.error('Invalid OpenAI response structure:', data)
      throw new Error('AI가 응답을 생성하지 못했습니다. 잠시 후 다시 시도해주세요.')
    }

    const aiResponse = data.choices[0].message.content

    // Save to database
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Saving to database...')

    const { error: dbError } = await supabase
      .from('chat_messages')
      .insert({
        content: content,
        ai_response: aiResponse,
        user_id: user_id
      })

    if (dbError) {
      console.error('Database error:', dbError)
      throw new Error('데이터베이스 저장 중 오류가 발생했습니다.')
    }

    console.log('Successfully saved to database')

    return new Response(
      JSON.stringify({ aiResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        details: error.toString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    )
  }
})