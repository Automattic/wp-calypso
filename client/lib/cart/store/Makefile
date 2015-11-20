REPORTER ?= spec
NODE_BIN := $(shell npm bin)
MOCHA ?= $(NODE_BIN)/mocha
BASE_DIR := $(NODE_BIN)/../..
NODE_PATH := test:$(BASE_DIR)/client:$(BASE_DIR)/shared


# In order to simply stub modules, add test to the NODE_PATH
test:
	@NODE_ENV=test NODE_PATH=$(NODE_PATH) $(MOCHA) --compilers js:babel/register-without-polyfill --reporter $(REPORTER)

integration:
	@NODE_ENV=test NODE_PATH=$(NODE_PATH) $(MOCHA) --compilers js:babel/register-without-polyfill --reporter $(REPORTER) test/integration

.PHONY: test integration
