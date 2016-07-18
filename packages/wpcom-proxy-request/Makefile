
# get Makefile directory name: http://stackoverflow.com/a/5982798/376773
THIS_MAKEFILE_PATH:=$(word $(words $(MAKEFILE_LIST)),$(MAKEFILE_LIST))
THIS_DIR:=$(shell cd $(dir $(THIS_MAKEFILE_PATH));pwd)

ROOT := index.js
include $(shell node -e "require('n8-make')")

# BIN directory
BIN := $(THIS_DIR)/node_modules/.bin

# applications
NODE ?= node
NPM ?= $(NODE) $(shell which npm)
WEBPACK ?= $(NODE) $(BIN)/webpack

# create standalone bundle for testing purpose
standalone: build build/wpcom-proxy-request.js

build/wpcom-proxy-request.js:
	@$(WEBPACK) -p --config ./examples/webpack.config.js

node_modules: package.json
	@NODE_ENV= $(NPM) install
	@touch node_modules

.PHONY: standalone