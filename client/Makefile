REPORTER ?= spec
NODE_BIN := $(shell npm bin)
MOCHA ?= $(NODE_BIN)/mocha
BASE_DIR := $(NODE_BIN)/../..
NODE_PATH := $(BASE_DIR)/client

test:
	@NODE_ENV=test NODE_PATH=$(NODE_PATH) node test/runner.js

test-%:
	@GREP="$*" make test

.PHONY: test test-%
