REPORTER ?= spec
NODE_BIN := $(shell npm bin)
MOCHA ?= $(NODE_BIN)/mocha
BASE_DIR := $(NODE_BIN)/../..
NODE_PATH := $(BASE_DIR)/client:$(BASE_DIR)/shared

test:
	@NODE_ENV=test NODE_PATH=$(NODE_PATH) $(MOCHA) --compilers js:babel/register --reporter $(REPORTER) --ui bdd

.PHONY: test

