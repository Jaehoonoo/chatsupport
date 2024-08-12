// import { NextResponse } from 'next/server';
import 'dotenv/config';
import { BedrockRuntimeClient, InvokeModelCommand, InvokeModelWithResponseStreamCommand } from "@aws-sdk/client-bedrock-runtime";
import { fromIni } from "@aws-sdk/credential-provider-ini";


export const invokeModelWithResponseStream = async (prompt) => {
    // Create a new Bedrock Runtime client instance.
    // Configure AWS SDK v3
    const client = new BedrockRuntimeClient({
        region: 'us-east-1',
        credentials: fromIni({ profile: "jhoon" })
    });
  
    // Prepare the payload for the model.
    const payload = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: [{ type: "text", text: prompt }],
        },
      ],
    };
  
    // Invoke Claude with the payload and wait for the API to respond.
    const command = new InvokeModelWithResponseStreamCommand({
      contentType: "application/json",
      body: JSON.stringify(payload),
      modelId: "anthropic.claude-3-haiku-20240307-v1:0",
    });
    const apiResponse = await client.send(command);
  
    let completeMessage = "";
  
    // Decode and process the response stream
    for await (const item of apiResponse.body) {
      const chunk = JSON.parse(new TextDecoder().decode(item.chunk.bytes));
      const chunk_type = chunk.type;
  
      if (chunk_type === "content_block_delta") {
        const text = chunk.delta.text;
        completeMessage = completeMessage + text;
        process.stdout.write(text);
      }
    }
  
    // Return the final response
    return completeMessage;
};

// export async function POST(req) {
//   const { prompt } = await req.json();
//   try {
//       const responseText = await invokeModelWithResponseStream(prompt);
//       return new NextResponse(responseText, { status: 200 });
//   } catch (error) {
//       console.error("Error invoking model:", error);
//       return new NextResponse("An error occurred while processing your request.", { status: 500 });
//   }
// }

console.log(invokeModelWithResponseStream("Who is Buddha?"))
