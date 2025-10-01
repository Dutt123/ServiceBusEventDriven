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
      console.log(`Received: ${messages[0].body}`);
      await receiver.completeMessage(messages[0]);

      console.log("Sleeping for 2 minutes before continuing...");
      await sleep(2 * 60 * 1000); // 2 minutes in milliseconds
      console.log("Resuming after sleep.");
    } else {
      console.log("No messages received.");
    }
  } finally {
    await receiver.close();
    await sbClient.close();
  }
}

main().catch(console.error);
