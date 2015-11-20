REPORTER ?= spec
# Can't use `$(shell npm bin)` for NODE_BIN since we have a package.json
NODE_BIN ?= ../../../../node_modules/.bin
BASE_DIR := $(NODE_BIN)/../..
MOCHA ?= $(NODE_BIN)/mocha
NODE_PATH := test:$(BASE_DIR)/client:$(BASE_DIR)/shared

test:
	@NODE_ENV=test NODE_PATH=$(NODE_PATH) $(MOCHA) --compilers jsx:babel/register --reporter $(REPORTER)

.PHONY: test
