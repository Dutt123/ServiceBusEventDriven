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
    const messages = await receiver.receiveMessages(1, { maxWaitTimeInMs: 30000 });

    if (messages.length > 0) {
      const message = messages[0];
      console.log(`Received: ${message.body}`);

      // Simulate different processing durations
      const body = message.body;
      let delay = 30 * 1000; // default 30 seconds

      if (body === "q1") delay = 30 * 1000;    // 30 sec
      if (body === "q2") delay = 60 * 1000;    // 1 min
      if (body === "q3") delay = 120 * 1000;   // 2 min
      if (body === "q4") delay = 90 * 1000;    // 1.5 min
      if (body === "q5") delay = 15 * 1000;    // 15 sec
      if (body === "q6") delay = 45 * 1000;    // 45 sec

      console.log(`Processing message ${body} for ${delay / 1000} seconds...`);
      await sleep(delay);

      await receiver.completeMessage(message);
      console.log(`Completed message ${body}`);
    } else {
      console.log("No messages received.");
    }
  } finally {
    await receiver.close();
    await sbClient.close();
  }
}

main().catch(console.error);
