import {headers} from "next/headers";
import {NextRequest} from "next/server";
import {Ratelimit} from "@upstash/ratelimit";
import {Redis} from "@upstash/redis";
import OpenAI from "openai";

const getClientIp = async () => {
  const headersList = await headers();
  const forwardedFor = headersList.get("x-forwarded-for");
  const forwarded = headersList.get("forwarded");
  const xRealIp = headersList.get("x-real-ip");

  const cleanIp = (ip: string) => ip.split(",")[0].trim();

  if (forwardedFor) {
    return cleanIp(forwardedFor);
  }

  if (xRealIp) {
    return cleanIp(xRealIp);
  }

  if (forwarded) {
    const match = forwarded.match(/for=(?:"?\[?)([^\]"]+)/);
    if (match) {
      return cleanIp(match[1]);
    }
  }

  return "Unknown IP";
};

export async function POST(req: NextRequest) {
  const {subject, message} = await req.json();
  try {
    const ip = await getClientIp();
    console.log(subject, message);
    const ratelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(3, "86400s"),
      analytics: true,
      prefix: "@upstash/ratelimit",
    });
    const {success} = await ratelimit.limit(ip);
    if (!success) {
      console.log("rate limit has been reached");
      return Response.json(
        {
          response: `You have reached the maximum limit for today!`,
        },
        {status: 500}
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPEN_AI_API!,
    });

    const template = `
    You are an expert brainstorming assistant focused on helping users generate innovative, practical, and well-developed ideas. Your role is to:

CORE RESPONSIBILITIES:
Based on the USER_INPUT_SUBJECT and USER_INPUT_EXTRA_DETAILS (if it exists)
1. Generate diverse ideas that balance creativity with practicality
2. Adapt to different domains while maintaining relevance
3. Provide structured, actionable output
4. Help refine and expand upon initial concepts

RESPONSE STRUCTURE:
For each brainstorming request, organize your response in the following format:

1. INITIAL IDEAS (3-5 core concepts)
  - Include brief descriptions
  - Highlight key benefits
  - Note potential challenges

2. EXPANSION POINTS
  - Related concepts
  - Alternative approaches
  - Potential combinations

3. IMPLEMENTATION CONSIDERATIONS
  - Resource requirements
  - Timeline estimates
  - Key stakeholders
  - Success metrics

  make the response in a nice and visually appealing markdown format for the best user experience
    `;

    const res = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-0125",
      temperature: 0.8,
      messages: [
        {role: "system", content: template},
        {role: "user", content: `USER_INPUT_SUBJECT: ${subject} USER_INPUT_EXTRA_DETAILS: ${message}`},
      ],
    });

    const response = res.choices[0].message.content;

    return Response.json({response}, {status: 200});
  } catch (error) {
    return Response.json({response: "Something Went Wrong!"}, {status: 500});
  }
}
