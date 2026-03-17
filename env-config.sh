# Install Claude Code
apt-get update && apt-get install -y --no-install-recommends curl ca-certificates && rm -rf /var/lib/apt/lists/*
echo "Trying to install Claude Code..."
curl -fsSL https://claude.ai/install.sh | bash
