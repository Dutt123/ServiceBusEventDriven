const { ServiceBusClient } = require("@azure/service-bus");
const { DefaultAzureCredential } = require("@azure/identity");

async function main() {
    const queueName = process.env.AZURE_SERVICE_BUS_QUEUE_NAME;
    const fullyQualifiedNamespace = process.env.AZURE_SERVICE_BUS_NAMESPACE; 
    // e.g. "stanukuservicebus.servicebus.windows.net"

    // Use managed identity
    const credential = new DefaultAzureCredential();
    const serviceBusClient = new ServiceBusClient(fullyQualifiedNamespace, credential);
    const receiver = serviceBusClient.createReceiver(queueName);

    try {
        console.log("Receiving messages with AAD...");
        receiver.subscribe({
            processMessage: async (message) => {
                console.log(`Received message: ${message.body}`);
            },
            processError: async (error) => {
                console.error("Error occurred:", error);
            },
        });

        await new Promise((resolve) => setTimeout(resolve, 60000));
    } finally {
        await receiver.close();
        await serviceBusClient.close();
    }
}

main().catch(console.error);
