const { ServiceBusClient } = require("@azure/service-bus");
const { DefaultAzureCredential } = require("@azure/identity");

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const queueName = process.env.AZURE_SERVICE_BUS_QUEUE_NAME;
  const fullyQualifiedNamespace = process.env.AZURE_SERVICE_BUS_NAMESPACE;

  const credential = new DefaultAzureCredential();
  const sbClient = new ServiceBusClient(fullyQualifiedNamespace, credential);
  const receiver = sbClient.createReceiver(queueName);

  try {
    console.log("Waiting for one message...");
     const body = typeof message.body === "string" ? message.body : JSON.stringify(message.body);
    const messages = await receiver.receiveMessages(1);

    if (messages.length > 0) {
      const message = messages[0];
      const body = typeof message.body === "string" ? message.body : JSON.stringify(message.body);
      console.log(`Received message: ${body}`);
      // Map processing times inside app code
      let processingTime = 0;
      switch (message.body) {
        case "q1":
          processingTime = 20;
          break;
        case "q2":
          processingTime = 45;
          break;
        case "q3":
          processingTime = 60;
          break;
        case "q4":
          processingTime = 10;
          break;
        case "q5":
          processingTime = 75;
          break;
        case "q6":
          processingTime = 30;
          break;
        default:
          processingTime = 0;
          console.log(`No specific processing time for ${message.body}`);
      }

      if (processingTime > 0) {
        console.log(`Processing message ${message.body} for ${processingTime} seconds...`);
        await sleep(processingTime * 1000);
      }

      await receiver.completeMessage(message);
      console.log(`✅ Completed message: ${message.body}`);
    } else {
      console.log("No messages received.");
    }
  } finally {
    await receiver.close();
    await sbClient.close();
  }
}

main().catch(console.error);
