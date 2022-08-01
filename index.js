const mineflayer = require("mineflayer");
const collectBlock = require("mineflayer-collectblock").plugin;

const options = {
  host: "localhost",
  port: 25565,
  username: "bagel",
};

const bot = mineflayer.createBot(options);

bot.loadPlugin(collectBlock);

let mcData

const { mineflayer: mineflayerViewer } = require("prismarine-viewer");
bot.once("spawn", () => {
  // mineflayerViewer(bot, { port: 25566, firstPerson: false, viewDistance: 12 }); // port is the minecraft server port, if first person is false, you get a bird's-eye view
  const mcData = require('minecraft-data')(bot.version);
});

// When a player says hello we need to say hi
bot.on("chat", (username, message) => {
  if (message === "hello") {
    bot.chat("hi");
  }
});


bot.on("chat", async (username, message) => {
  const args = message.split(" ");
  if (args[0] !== "collect") return;

  let count = 1;
  if (args.length === 3) count = parseInt(args[1]);

  let type = args[1];
  if (args.length === 3) type = args[2];

  const blockType = mcData.blocksByName[type];
  if (!blockType) {
    return;
  }

  const blocks = bot.findBlocks({
    matching: blockType.id,
    maxDistance: 64,
    count: count,
  });

  if (blocks.length === 0) {
    bot.chat("I don't see that block nearby.");
    return;
  }

  const targets = [];
  for (let i = 0; i < Math.min(blocks.length, count); i++) {
    targets.push(bot.blockAt(blocks[i]));
  }

  bot.chat(`Found ${targets.length} ${type}(s)`);

  try {
    await bot.collectBlock.collect(targets);
    // All blocks have been collected.
    bot.chat("Done");
  } catch (err) {
    // An error occurred, report it.
    bot.chat(err.message);
    console.log(err);
  }
});