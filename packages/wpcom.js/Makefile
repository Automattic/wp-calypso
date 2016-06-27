# get Makefile directory name: http://stackoverflow.com/a/5982798/376773
THIS_MAKEFILE_PATH:=$(word $(words $(MAKEFILE_LIST)),$(MAKEFILE_LIST))
THIS_DIR:=$(shell cd $(dir $(THIS_MAKEFILE_PATH));pwd)

include $(shell node -e "require('n8-make')")

# BIN directory
BIN := $(THIS_DIR)/node_modules/.bin

# Testing WEB APP port
TESTAPP_DIR := webapp/tests
TESTAPP_PORT := 3001

# Files
JS_FILES := $(wildcard index.js lib/*.js test/*.js)
JS_TESTING_FILES := $(wildcard test/test*.js test-whitelist/test*.js)

# applications
NODE ?= node
NPM ?= $(NODE) $(shell which npm)
MOCHA ?= $(NODE) $(BIN)/mocha
WEBPACK ?= $(NODE) $(BIN)/webpack

standalone: build/wpcom.js

build/wpcom.js: $(COMPILED_FILES)

install: node_modules

node_modules:
	@NODE_ENV= $(NPM) install
	@touch node_modules

lint: node_modules/eslint node_modules/babel-eslint
	@$(BIN)/eslint $(JS_FILES)

eslint: lint

example-server:
	cd examples/server/; $(NPM) install
	$(NODE) examples/server/index.js

test: build
	@$(MOCHA) \
		--timeout 120s \
		--slow 3s \
		--grep "$(FILTER)" \
		--bail \
		--reporter spec \
		build/test

test-all: build
	@$(MOCHA) \
		--timeout 120s \
		--slow 3s \
		--bail \
		--reporter spec \
		build/test

publish: clean standalone
	$(NPM) publish

# testing client app
test-app: build build/test/testing-source.js
	mkdir -p webapp/tests
	cp test/fixture.json build/test/
	cp test/config.json build/test/
	cp test/util.js build/test/
	cp ./node_modules/mocha/mocha.js $(TESTAPP_DIR)
	cp ./node_modules/mocha/mocha.css $(TESTAPP_DIR)
	@$(WEBPACK) -p --config ./webpack.tests.config.js

run-test-app: build test-app
	cd $(TESTAPP_DIR); serve -p $(TESTAPP_PORT)

build/test/testing-source.js: ${JS_TESTING_FILES}
	mkdir -p build/test/
	cat > $@ $^

webapp:
	@$(WEBPACK) -p --config webapp/webpack.config.js

deploy: test-app webapp
	mkdir -p tmp/
	rm -rf tmp/*
	mkdir -p tmp/tests
	cp webapp/index.html tmp/
	cp webapp/style.css tmp/
	cp webapp/webapp-bundle.js tmp/
	cp $(TESTAPP_DIR)/index.html tmp/tests
	cp $(TESTAPP_DIR)/mocha.css tmp/tests
	cp $(TESTAPP_DIR)/mocha.js tmp/tests
	cp $(TESTAPP_DIR)/testing-bundle.js tmp/tests
	git checkout gh-pages
	cp -rf tmp/* .
	git add ./ -v
	git commit -m "built"
	git push origin gh-pages
	git checkout -

.PHONY: standalone example-server test test-all publish node_modules lint eslint webapp
