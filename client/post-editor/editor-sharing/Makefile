REPORTER ?= spec
MOCHA ?= ../../../node_modules/.bin/mocha
NODE_BIN := $(shell npm bin)
BASE_DIR := $(NODE_BIN)/../..
NODE_PATH := test:$(BASE_DIR)/client:$(BASE_DIR)/shared

test:
	@NODE_ENV=test NODE_PATH=$(NODE_PATH) $(MOCHA) --compilers jsx:babel/register --reporter $(REPORTER)

.PHONY: test
