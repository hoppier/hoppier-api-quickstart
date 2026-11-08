try {
  process.loadEnvFile();
} catch {
  console.error("No .env file here. Copy .env.example to .env and fill it in.");
  process.exit(1);
}
