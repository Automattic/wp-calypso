#!/bin/bash
NVM_VERSION="v0.33.8"

# Exit if any command fails
set -e

# Include useful functions
. "$(dirname "$0")/includes.sh"

# Load NVM
if [ -n "$NVM_DIR" ]; then
	# The --no-use option ensures loading NVM doesn't switch the current version.
	if [ -f "$NVM_DIR/nvm.sh" ]; then
		. "$NVM_DIR/nvm.sh" --no-use
	elif command_exists "brew" && [ -f "$(brew --prefix nvm)/nvm.sh" ]; then
		# use homebrew if that's how nvm was installed
		. "$(brew --prefix nvm)/nvm.sh" --no-use
	fi
fi

# Change to the expected directory
cd "$(dirname "$0")/.."

# Check if nvm is installed
if [ "$TRAVIS" != "true" ] && ! command_exists "nvm"; then
	if ask "$(error_message "NVM isn't installed, would you like to download and install it automatically?")" Y; then
		# The .bash_profile file needs to exist for NVM to install
		if [ ! -e ~/.bash_profile ]; then
			touch ~/.bash_profile
		fi

		echo -en $(status_message "Installing NVM..." )
		download "https://raw.githubusercontent.com/creationix/nvm/$NVM_VERSION/install.sh" | bash >/dev/null 2>&1
		echo ' done!'

		echo -e $(warning_message "NVM was updated, please run this command to reload it:" )
		echo -e $(warning_message "$(action_format ". \$HOME/.nvm/nvm.sh")" )
		echo -e $(warning_message "After that, re-run the setup script to continue." )
	else
		echo -e $(error_message "")
		echo -e $(error_message "Please install NVM manually, then re-run the setup script to continue.")
		echo -e $(error_message "NVM installation instructions can be found here: $(action_format "https://github.com/creationix/nvm")")
	fi

	exit 1
fi

# Check if the current nvm version is up to date.
if [ "$TRAVIS" != "true" ] && [ $NVM_VERSION != "v$(nvm --version)" ]; then
	echo -en $(status_message "Updating NVM..." )
	download "https://raw.githubusercontent.com/creationix/nvm/$NVM_VERSION/install.sh" | bash >/dev/null 2>&1
	echo ' done!'

	echo -e $(warning_message "NVM was updated, please run this command to reload it:" )
	echo -e $(warning_message "$(action_format ". \$HOME/.nvm/nvm.sh")" )
	echo -e $(warning_message "After that, re-run the setup script to continue." )
	exit 1
fi

# Check if the current node version is up to date.
if [ "$TRAVIS" != "true" ] && [ "$(nvm current)" != "$(nvm version-remote --lts)" ]; then
	echo -e $(warning_message "Node version does not match the latest long term support version. Please run this command to install and use it:" )
	echo -e $(warning_message "$(action_format "nvm install")" )
	echo -e $(warning_message "After that, re-run the setup script to continue." )
	exit 1
fi

# Install/update packages
echo -e $(status_message "Installing and updating NPM packages..." )
npm install

# Make sure npm is up-to-date
npm install npm -g

# There was a bug in NPM that caused changes in package-lock.json. Handle that.
if [ "$TRAVIS" != "true" ] && ! git diff --exit-code package-lock.json >/dev/null; then
	if ask "$(warning_message "Your package-lock.json changed, which may mean there's an issue with your NPM cache. Would you like to try and automatically clean it up?" )" N 10; then
		rm -rf node_modules/
		npm cache clean --force >/dev/null 2>&1
		git checkout package-lock.json

		echo -e $(status_message "Reinstalling NPM packages..." )
		npm install

		# Check that it's cleaned up now.
		if git diff --exit-code package-lock.json >/dev/null; then
			echo -e $(warning_message "Confirmed that the NPM cache is cleaned up." )
		else
			echo -e $(error_message "We were unable to clean the NPM cache, please manually review the changes to package-lock.json. Continuing with the setup process..." )
		fi
	else
		echo -e $(warning_message "Please manually review the changes to package-lock.json. Continuing with the setup process..." )
	fi
fi
