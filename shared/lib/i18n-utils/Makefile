REPORTER ?= spec
NODE_BIN := $(shell npm bin)
MOCHA ?= $(NODE_BIN)/mocha
BASE_DIR := $(NODE_BIN)/../..

test:
	@NODE_ENV=test NODE_PATH=$(BASE_DIR)/client $(MOCHA) --reporter $(REPORTER)

.PHONY: test
