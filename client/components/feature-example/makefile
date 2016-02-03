REPORTER ?= spec
NODE_BIN := $(shell npm bin)
MOCHA ?= ../../../node_modules/.bin/mocha
BASE_DIR := $(NODE_BIN)/../..
NODE_PATH := test:$(BASE_DIR)/client

test:
	@NODE_ENV=test NODE_PATH=$(NODE_PATH) $(MOCHA) --compilers jsx:babel/register --reporter $(REPORTER)

.PHONY: test
