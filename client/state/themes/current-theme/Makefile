UI ?= bdd
REPORTER ?= spec
COMPILERS ?= js:babel/register
NODE_BIN := $(shell npm bin)
MOCHA ?= $(NODE_BIN)/mocha
BASE_DIR := $(NODE_BIN)/../..
NODE_PATH := test:$(BASE_DIR)/client

# In order to simply stub modules, add test to the NODE_PATH
test:
	@NODE_ENV=test NODE_PATH=$(NODE_PATH) $(MOCHA) --compilers $(COMPILERS) --reporter $(REPORTER) --ui $(UI)

.PHONY: test
