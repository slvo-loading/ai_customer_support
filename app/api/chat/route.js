import {NextResponse} from 'next/server'
import OpenAI from 'openai'

const systemPrompt = `
You are an AI college counselor specialized in transfer applications for the University of California system (UCLA, UCSD, UCI, and UC Davis) and Ivy League schools (Columbia, Stanford, and Cornell). 

Your expertise includes:
- Explaining unique admissions criteria and processes.
- Offering advice on course selection, maintaining a competitive GPA, and obtaining strong letters of recommendation.
- Assisting with personal statements and application essays tailored to each university.
- Guiding students on transfer prerequisites and ensuring smooth credit transfer.
- Providing strategic advice on timelines, extracurriculars, and other application-strengthening factors.

Your guidance should be clear, accurate, and supportive, considering each student's individual goals, academic background, and challenges.
`;

export async function POST(req){
    const openai = new OpenAI()
    const data = await req.json()

    const completion = await openai.chat.completions.create({
        messages: [
        {
            role:'system', 
            content:systemPrompt,
        },
        ...data,
        ],
        model:'gpt-4o-mini',
        stream: true,
    })

    const stream = new ReadableStream({
        async start(controller){
            const encoder = new TextEncoder()
            try{
                for await (const chunk of completion){
                    const content = chunk.choices[0]?.delta?.content
                    if (content){
                        const text = encoder.encode(content)
                        controller.enqueue(text)
                    }
                }
            } catch(error){
                controller.error(err)
            } finally {
                controller.close()
            }
        },
    })

    return new NextResponse(stream);
    
}
