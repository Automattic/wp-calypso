REPORTER ?= spec
NODE_BIN := $(shell npm bin)
BASE_DIR := $(NODE_BIN)/../..
NODE_PATH := $(BASE_DIR)/test:$(BASE_DIR)/server:$(BASE_DIR)/client
BABEL := $(NODE_BIN)/babel

test: i18n/test/out
	@NODE_ENV=development NODE_PATH=$(NODE_PATH) $(BASE_DIR)/test/runner.js --reporter=$(REPORTER) $(addprefix --grep ,$(GREP))

	@$(MAKE) clean

test-%: i18n/test/out
	@GREP="$*" make test

i18n/test/out: i18n/test/examples
	@$(BABEL) i18n/test/examples --out-dir i18n/test/out > /dev/null

clean:
	@rm -rf i18n/test/out

.PHONY: test test-% clean
