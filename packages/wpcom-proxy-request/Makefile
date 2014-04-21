
# get Makefile directory name: http://stackoverflow.com/a/5982798/376773
THIS_MAKEFILE_PATH:=$(word $(words $(MAKEFILE_LIST)),$(MAKEFILE_LIST))
THIS_DIR:=$(shell cd $(dir $(THIS_MAKEFILE_PATH));pwd)

# BIN directory
BIN := $(THIS_DIR)/node_modules/.bin

# applications
NODE ?= node
NPM ?= $(NODE) $(shell which npm)
BROWSERIFY ?= $(NODE) $(BIN)/browserify
ADD_COMPONENT_SYMLINKS ?= $(NODE) $(BIN)/add-component-symlinks

standalone: dist/wpcom-proxy-request.js

install: node_modules

clean:
	@rm -rf node_modules dist

dist:
	@mkdir $@

dist/wpcom-proxy-request.js: node_modules index.js dist
	@$(BROWSERIFY) -s wpcomProxyRequest index.js > $@

node_modules: package.json
	@NODE_ENV= $(NPM) install
	@$(ADD_COMPONENT_SYMLINKS)
	@touch node_modules


.PHONY: standalone install clean
