REPORTER ?= spec
NODE_BIN := $(shell npm bin)
BASE_DIR := $(NODE_BIN)/../..
NODE_PATH := $(BASE_DIR)/client

test:
	@NODE_ENV=development NODE_PATH=$(NODE_PATH) node test/runner.js --reporter=$(REPORTER)

test-%:
	@GREP="$*" make test

.PHONY: test test-%
