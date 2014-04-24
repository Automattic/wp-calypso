
# get Makefile directory name: http://stackoverflow.com/a/5982798/376773
THIS_MAKEFILE_PATH:=$(word $(words $(MAKEFILE_LIST)),$(MAKEFILE_LIST))
THIS_DIR:=$(shell cd $(dir $(THIS_MAKEFILE_PATH));pwd)

# BIN directory
BIN := $(THIS_DIR)/node_modules/.bin

# applications
NODE ?= node
NPM ?= $(NODE) $(shell which npm)
MOCHA ?= $(NODE) $(BIN)/mocha
BROWSERIFY ?= $(NODE) $(BIN)/browserify

all: dist/wpcom.js dist/wpcom-proxy.js

standalone-xhr: dist/wpcom.js

standalone-proxy: dist/wpcom-proxy.js

install: node_modules

clean:
	@rm -rf node_modules dist

dist:
	@mkdir -p $@

dist/wpcom.js: node_modules index.js wpcom+xhr.js dist lib/*
	@$(BROWSERIFY) -s WPCOM wpcom+xhr.js > $@

dist/wpcom-proxy.js: node_modules index.js wpcom+proxy.js dist lib/*
	@$(BROWSERIFY) -s WPCOM wpcom+proxy.js > $@

node_modules: package.json
	@NODE_ENV= $(NPM) install
	@touch node_modules

test:
	@$(MOCHA) \
		--timeout 10s \
		--slow 3s \
		--bail \
		--reporter spec


.PHONY: standalone install clean test
