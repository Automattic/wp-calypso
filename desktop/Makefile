export SHELL = /bin/bash

ifeq ($(OS),Windows_NT)
	FILE_PATH_SEP := $(strip \)
	ENV_PATH_SEP := ;
else
	FILE_PATH_SEP := /
	ENV_PATH_SEP := :
endif

/ = $(FILE_PATH_SEP)

MAKEFILE_PATH := $(word $(words $(MAKEFILE_LIST)),$(MAKEFILE_LIST))
DESKTOP_DIR := $(shell cd $(dir $(MAKEFILE_PATH));pwd)
CALYPSO_DIR := $(dir $(DESKTOP_DIR))

export CONFIG_ENV = release
export NODE_ENV = production
export ELECTRON_BUILDER_ARGS =
export NODE_OPTIONS = --max_old_space_size=8192

.PHONY: build build-ci config server client source package

build:
	$(info Building app...)

	@cd $(CALYPSO_DIR) && yarn run build-desktop

config:
	$(info Building config...)

	@cd $(CALYPSO_DIR) && yarn run build-desktop:config

server:
	$(info Building app server...)

	@cd $(CALYPSO_DIR) && yarn run build-desktop:server

client:
	$(info Building app client...)

	@cd $(CALYPSO_DIR) && yarn run build-desktop:client

source:
	$(info Building app source...)

	@cd $(CALYPSO_DIR) && yarn run build-desktop:source

secrets:
	$(info Making app secrets...)

	@cd $(CALYPSO_DIR) && yarn run build-desktop:secrets

# Note: cannot prepend prepend desktop/package.json with full path: cannot be resolved on Windows.
package: PACKAGE_ELECTRON_VERSION = $(shell cd $(DESKTOP_DIR) && node -e "console.log(require('./package.json').devDependencies.electron)")
package:
	$(info Packaging app...)

	@cd $(DESKTOP_DIR) && npx electron-builder ${ELECTRON_BUILDER_ARGS} -c.electronVersion=$(PACKAGE_ELECTRON_VERSION) build --publish never

e2e:
	$(info Running end-to-end tests...)

	@cd $(CALYPSO_DIR) && yarn run test-desktop:e2e

clean:
	@rm -rf $(DESKTOP_DIR)$/release

# Sed to strip leading v to ensure 'v1.2.3' and '1.2.3' can match.
# The .nvmrc file may contain either, `node --version` prints with 'v' prefix.
CALYPSO_NODE_VERSION := $(shell cat $(CALYPSO_DIR)/.nvmrc | sed -n 's/v\{0,1\}\(.*\)/\1/p')

# Docker environment for local development.
# ONESHELL requires GNU make v3.82 or above.
.PHONY: docker-build
.ONESHELL:
docker-build: $(SSH_PRIVATE_KEY_FILE)
docker-build: NODE_VERSION = $(CALYPSO_NODE_VERSION)
docker-build:
	$(info Building docker image 'wpdesktop'... )

# !! Ensure this file is removed regardless of success/failure !!
# Note: Ideally we could use a build argument for this, but Docker CE on Windows
# has trouble consuming the SSH key contents when passed as a build arg.
	function cleanup {
		rm "$(DESKTOP_DIR)/id_rsa"
	}
	trap cleanup EXIT

	cp "$(SSH_PRIVATE_KEY_FILE)" "$(DESKTOP_DIR)/id_rsa"

	@docker build --build-arg NODE_VERSION --tag wpdesktop .

.PHONY: docker-run
docker-run:
	$(info Initializing docker container for 'wpdesktop', type 'exit' to quit)

	docker run -it --rm -v "$(CALYPSO_DIR)"://usr/src/wp-calypso -p 3000:3000 -e SHELL='//bin/bash' wpdesktop bash

.PHONY: docker-clean
docker-clean:
	$(info Removing docker image 'wpdesktop'...)

	docker image rm wpdesktop
