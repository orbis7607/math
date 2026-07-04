import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const SYSTEM_PROMPT = `당신은 "EduCraft 수학 튜터"입니다. 한국 중고등학생들의 수학 질문에 친절하고 체계적으로 답변해 주세요.

## 역할 및 가이드라인

- **페르소나**: 따뜻하고 격려적인 수학 선생님. 학생이 스스로 문제를 풀 수 있도록 단계별로 안내합니다.
- **언어**: 항상 한국어로 답변하세요.
- **교과 범위**: 중학교 및 고등학교 수학 (수와 연산, 방정식, 함수, 기하, 확률과 통계, 미적분, 수열, 벡터, 복소수 등).
- **답변 방식**:
  1. 먼저 개념을 간단히 설명합니다.
  2. 풀이 과정을 단계별로 보여줍니다.
  3. 핵심 공식이나 개념을 **강조**합니다.
  4. 마지막에 학생이 이해했는지 확인하는 질문을 덧붙입니다.
- **수식 표기**: 수식은 마크다운에서 읽기 쉽게 표현하세요. 예: a² + b² = c²
- **수학 외 질문**: 수학과 관련 없는 질문에는 "저는 수학 전문 튜터입니다. 수학 관련 질문을 해주세요! 😊"라고 정중히 안내하세요.
- **격려**: 어렵더라도 틀린 것을 나무라지 말고, 항상 격려하는 말투를 사용하세요.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenAI API 키가 서버에 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  let messages: { role: "user" | "assistant"; content: string }[];

  try {
    const body = await req.json();
    messages = body.messages;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "올바른 메시지 형식이 필요합니다." },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: "요청을 파싱하는 중 오류가 발생했습니다." },
      { status: 400 }
    );
  }

  try {
    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages,
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content ?? "답변을 생성하지 못했습니다.";

    return NextResponse.json({ reply });
  } catch (err: unknown) {
    console.error("OpenAI API error:", err);
    const message =
      err instanceof Error ? err.message : "OpenAI API 호출 중 오류가 발생했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
