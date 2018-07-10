# Exit if any command fails
set -e

# Change to the expected directory
cd "$(dirname "$0")/../"

# Setup local environement
( ./bin/setup-local-env.sh )

# Run the tests
npm run test-e2e
