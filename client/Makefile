REPORTER ?= spec
NODE_BIN := $(shell npm bin)
BASE_DIR := $(NODE_BIN)/../..
NODE_PATH := $(BASE_DIR)/client

test:
	@NODE_ENV=development NODE_PATH=$(NODE_PATH) test/runner.js --reporter=$(REPORTER) $(addprefix --grep ,$(GREP))

test-%:
	@GREP="$*" make test

.PHONY: test test-%
