NODE_BIN := $(shell npm bin)
MOCHA ?= $(NODE_BIN)/mocha
BASE_DIR := $(NODE_BIN)/../..
NODE_PATH := test:$(BASE_DIR)/client
COMPILERS ?= jsx:babel/register
REPORTER ?= spec
UI ?= bdd

# Adding a 5 second timeout so that these tests don't fail in Circle CI
# e.g. https://circleci.com/gh/Automattic/wp-calypso/756
test:
	@NODE_ENV=test NODE_PATH=$(NODE_PATH) $(MOCHA) --compilers $(COMPILERS) --reporter $(REPORTER) --ui $(UI) --timeout 5000

.PHONY: test
