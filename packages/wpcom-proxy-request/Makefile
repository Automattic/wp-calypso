
# get Makefile directory name: http://stackoverflow.com/a/5982798/376773
THIS_MAKEFILE_PATH:=$(word $(words $(MAKEFILE_LIST)),$(MAKEFILE_LIST))
THIS_DIR:=$(shell cd $(dir $(THIS_MAKEFILE_PATH));pwd)

ROOT := index.js test
include $(shell node -e "require('n8-make')")

NODE_MODULES = $(THIS_DIR)/node_modules
BIN := $(NODE_MODULES)/.bin
TEST_APP_FOLDER := 'client-test-app'

APP_PORT := 3001

# applications
NODE ?= node
NPM ?= $(NODE) $(shell which npm)
CHOKI ?= $(BIN)/chokidar
WEBPACK ?= $(NODE) $(BIN)/webpack
SERVE = $(BIN)/serve

# create standalone bundle for testing purpose
standalone: build build/wpcom-proxy-request.js

build/wpcom-proxy-request.js:
	@$(WEBPACK) -p --config ./examples/webpack.config.js

# Client Test APP
build-test-app: build client-test-app client-test-app/mocha.js client-test-app/mocha.css client-test-app/bundle.js

watch-test-app:
	make build-test-app& $(CHOKI) $(ROOT) -c 'make'

client-test-app:
	mkdir -p $(TEST_APP_FOLDER)

client-test-app/mocha.js:
	cp $(NODE_MODULES)/mocha/mocha.js $(TEST_APP_FOLDER)

client-test-app/mocha.css:
	cp $(NODE_MODULES)/mocha/mocha.css $(TEST_APP_FOLDER)

client-test-app/bundle.js:
	@$(WEBPACK) \
		--watch \
		build/test/index.js \
		$(TEST_APP_FOLDER)/bundle.js

run-test-app:
	cd $(TEST_APP_FOLDER); $(SERVE) -p ${APP_PORT}

node_modules: package.json
	@NODE_ENV= $(NPM) install
	@touch node_modules

.PHONY: standalone start-test-app client-test-app/bundle.js