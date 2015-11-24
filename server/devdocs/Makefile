NODE_BIN := $(shell npm bin)
MOCHA ?= $(NODE_BIN)/mocha
BASE_DIR := $(NODE_BIN)/../..
NODE_PATH := test:$(BASE_DIR)/client:$(BASE_DIR)/shared:$(BASE_DIR)/server
COMPILERS ?= js:babel/register
REPORTER ?= spec
UI ?= bdd

test:
	@NODE_ENV=test NODE_PATH=$(NODE_PATH) $(MOCHA) --compilers $(COMPILERS) --reporter $(REPORTER) --ui $(UI)

.PHONY: test
