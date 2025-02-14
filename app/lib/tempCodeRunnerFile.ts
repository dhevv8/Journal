if (!process.env.ARCJET_KEY) {
    throw new Error('ARCJET_KEY is not defined in the environment variables');
  }