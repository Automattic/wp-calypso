#!/bin/bash

# Exit if any command fails
set -e

# Include useful functions
. "$(dirname "$0")/includes.sh"

# Change to the expected directory
cd "$(dirname "$0")/.."

# Check Node and NVM are installed
. "$(dirname "$0")/install-node-nvm.sh"

# Check Docker is installed and running
. "$(dirname "$0")/install-docker.sh"

! read -d '' GUTENBERG <<"EOT"
,⁻⁻⁻·       .                 |
|  ،⁓’.   . |---  ,---. ,---. |---. ,---. ,---. ,---.
|   | |   | |     |---' |   | |   | |---' |     |   |
`---' `---' `---’ `---’ '   ` `---' `---’ `     `---|
                                                `---'
EOT

CURRENT_URL=$(docker-compose run -T --rm cli option get siteurl)

echo -e "\nWelcome to...\n"
echo -e "\033[95m$GUTENBERG\033[0m"
echo -e "Run $(action_format "npm run dev"), then open $(action_format "$CURRENT_URL") to get started!"
