
# get Makefile directory name: http://stackoverflow.com/a/5982798/376773
THIS_MAKEFILE_PATH:=$(word $(words $(MAKEFILE_LIST)),$(MAKEFILE_LIST))
THIS_DIR:=$(shell cd $(dir $(THIS_MAKEFILE_PATH));pwd)

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
BABEL ?= $(NODE) $(BIN)/babel
WEBPACK ?= $(NODE) $(BIN)/webpack

standalone: dist/wpcom.js

install: node_modules

clean:
	@rm -rf dist

distclean: clean
	@rm -rf node_modules

dist: dist/lib dist/test
	@mkdir -p $@

dist/lib: dist/lib/util
	@mkdir -p $@

dist/lib/util:
	@mkdir -p $@

dist/test:
	@mkdir -p $@

dist/wpcom.js: *.js dist lib/*.js
	@$(WEBPACK) -p --config webpack.config.js

babelify: dist
	@$(BABEL) \
		index.js \
		--optional runtime \
		--out-file dist/index.js
	@$(BABEL) \
		lib \
		--optional runtime \
		--out-dir dist/lib
	@$(BABEL) \
		lib/util \
		--optional runtime \
		--out-dir dist/lib/util
	@$(BABEL) \
		test \
		--optional runtime \
		--out-dir dist/test

node_modules:
	@NODE_ENV= $(NPM) install
	@touch node_modules

lint: node_modules/eslint node_modules/babel-eslint
	@$(BIN)/eslint $(JS_FILES)

eslint: lint

example-server:
	cd examples/server/; $(NPM) install
	$(NODE) examples/server/index.js

test: babelify
	@$(MOCHA) \
		--compilers js:babel/register \
		--timeout 120s \
		--slow 3s \
		--grep "$(filter-out $@,$(MAKECMDGOALS))" \
		--bail \
		--reporter spec

test-all: babelify
	@$(MOCHA) \
		--compilers js:babel/register \
		--timeout 120s \
		--slow 3s \
		--bail \
		--reporter spec

commit-dist: clean standalone babelify
	git add dist/ -v
	git commit -m "re-build dist/"

publish: clean standalone
	$(NPM) publish

# testing client app
test-app: babelify dist/test/testing-source.js
	mkdir -p webapp/tests
	cp test/fixture.json dist/test/
	cp test/config.json dist/test/
	cp test/util.js dist/test/
	cp ./node_modules/mocha/mocha.js $(TESTAPP_DIR)
	cp ./node_modules/mocha/mocha.css $(TESTAPP_DIR)
	@$(WEBPACK) -p --config ./webpack.tests.config.js

run-test-app: babelify test-app
	cd $(TESTAPP_DIR); serve -p $(TESTAPP_PORT)

dist/test/testing-source.js: ${JS_TESTING_FILES}
	mkdir -p dist/test/
	cat > $@ $^

webapp:
	@$(WEBPACK) -p --config webapp/webpack.config.js

deploy:
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

.PHONY: standalone clean distclean babelify example-server test test-all publish node_modules lint eslint webapp
