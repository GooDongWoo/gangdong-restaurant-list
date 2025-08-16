// 파일 경로: supabase/functions/submit-guestbook/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

console.log("Function 'submit-guestbook' called");

Deno.serve(async (req) => {
  // CORS preflight 요청을 처리합니다. 브라우저 보안 정책에 필요합니다.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { recaptchaToken, postData } = await req.json();
    console.log("Received data for restaurant:", postData.restaurant_id);

    if (!recaptchaToken || !postData) {
      throw new Error("Missing recaptcha token or post data.");
    }

    // 1. reCAPTCHA 토큰 검증
    // Deno.env.get()을 통해 안전하게 비밀 키를 가져옵니다.
    const recaptchaSecret = Deno.env.get('RECAPTCHA_SECRET_KEY');
    if (!recaptchaSecret) {
      throw new Error("RECAPTCHA_SECRET_KEY is not set in environment variables.");
    }

    const googleVerifyURL = `https://www.google.com/recaptcha/api/siteverify`;
    
    // 구글 서버에 검증 요청을 보냅니다.
    const verificationResponse = await fetch(googleVerifyURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${recaptchaSecret}&response=${recaptchaToken}`
    });
    
    if (!verificationResponse.ok) {
        throw new Error("Failed to contact Google reCAPTCHA services.");
    }
      
    const verificationData = await verificationResponse.json();
    console.log("reCAPTCHA verification result:", verificationData.success);

    // 검증 실패 시 에러를 반환하고 함수를 종료합니다.
    if (!verificationData.success) {
      return new Response(JSON.stringify({ error: '로봇이 아닙니다. 인증에 실패했습니다.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }
    
    // 2. Supabase Admin 클라이언트 생성
    // 여기서는 RLS를 우회하는 service_role 키를 사용하여 서버에서 안전하게 데이터를 삽입합니다.
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 3. 데이터베이스에 글 등록
    console.log("Inserting post data into 'guestbook' table.");
    const { error } = await supabaseAdmin.from('guestbook').insert([postData]);

    if (error) {
      console.error("Supabase insert error:", error);
      throw error;
    }

    // 4. 성공 응답 반환
    return new Response(JSON.stringify({ message: '성공적으로 등록되었습니다.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err) {
    console.error("An unexpected error occurred:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});