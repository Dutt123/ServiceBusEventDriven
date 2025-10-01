const { ServiceBusClient } = require("@azure/service-bus");
const { DefaultAzureCredential } = require("@azure/identity");

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function normalizeBody(messageBody) {
  if (Buffer.isBuffer(messageBody)) {
    return messageBody.toString("utf8").trim();
  }
  if (typeof messageBody === "object" && messageBody?.data) {
    return Buffer.from(messageBody.data).toString("utf8").trim();
  }
  return String(messageBody).trim().replace(/^"|"$/g, ""); // remove quotes if present
}

async function main() {
  const queueName = process.env.AZURE_SERVICE_BUS_QUEUE_NAME;
  const fullyQualifiedNamespace = process.env.AZURE_SERVICE_BUS_NAMESPACE;

  const credential = new DefaultAzureCredential();
  const sbClient = new ServiceBusClient(fullyQualifiedNamespace, credential);
  const receiver = sbClient.createReceiver(queueName);

  try {
    console.log("Waiting for one message...");
    const messages = await receiver.receiveMessages(1);

    if (messages.length > 0) {
      const message = messages[0];
      const body = normalizeBody(message.body);
      console.log(`Received message: ${body}`);

      // Processing times
      const timings = {
        q1: 360,
        q2: 45,
        q3: 560,
        q4: 100,
        q5: 175,
        q6: 30,
      };

      const processingTime = timings[body] || 0;

      if (processingTime > 0) {
        console.log(`⏳ Processing ${body} for ${processingTime} seconds...`);
        await sleep(processingTime * 1000);
      } else {
        console.log(`❌ No specific processing time for ${body}`);
      }

      await receiver.completeMessage(message);
      console.log(`✅ Completed message: ${body}`);
    } else {
      console.log("No messages received.");
    }
  } finally {
    await receiver.close();
    await sbClient.close();
  }
}

main().catch(console.error);
