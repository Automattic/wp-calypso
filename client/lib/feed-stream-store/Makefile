NODE_BIN := $(shell npm bin)
MOCHA ?= $(NODE_BIN)/mocha
BASE_DIR := $(NODE_BIN)/../..
NODE_PATH := test:$(BASE_DIR)/client:$(BASE_DIR)/shared
COMPILERS ?= js:babel/register-without-polyfill
REPORTER ?= spec
UI ?= bdd

test:
	@NODE_ENV=test NODE_PATH=$(NODE_PATH) $(MOCHA) --compilers $(COMPILERS) --reporter $(REPORTER) --ui $(UI)

test-w:
	@NODE_ENV=test NODE_PATH=$(NODE_PATH) $(MOCHA) --compilers $(COMPILERS) --reporter min --watch -b

.PHONY: test test-w
