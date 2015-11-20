REPORTER ?= spec
MOCHA ?= ../../../node_modules/.bin/mocha

# In order to simply stub modules, add test to the NODE_PATH
test:
	@NODE_ENV=test NODE_PATH=test:../../../client $(MOCHA) --compilers js:babel/register-without-polyfill --reporter $(REPORTER)

test-w:
	@NODE_ENV=test NODE_PATH=test:../../../client $(MOCHA) --compilers js:babel/register-without-polyfill --reporter min --watch --growl -b

.PHONY: test
