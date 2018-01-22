const cleaners = [];

async function run(starter) {
  const args = process.argv.slice(2);
  const config = {};

  const app = {
    logger: console,

    args,

    set: (name, value) => {
      config[name] = value;
    },

    get: name => config[name],

    addExitHandler: (cleaner) => {
      cleaners.unshift(cleaner);
    },

    appendExitHandler: (cleaner) => {
      cleaners.push(cleaner);
    },
  };

  try {
    await starter(app);
  } catch (e) {
    app.logger.error(e);
    return;
  }

  async function shutdown() {
    app.logger.info('Shutting down gracefully');

    // Run all the cleaners before shutting down
    await cleaners.reduce((res, cleaner) => (
      res.then(() => cleaner())
    ), Promise.resolve(null));

    process.nextTick(() => process.exit());
  }

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

exports.default = run;
module.exports = run;
