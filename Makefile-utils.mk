# Portability
ifdef ComSpec
	RM := del /F /Q
    SLASH :=\\
else
	RM := rm -rf
    SLASH :=/
endif

# Use $/ as the path separator
/ := $(strip $(SLASH))

# File classes
FILES_JS := $(shell \
	find . \
		-not \( -path '.$/.git' -prune \) \
		-not \( -path '.$/build' -prune \) \
		-not \( -path '.$/node_modules' -prune \) \
		-not \( -path '.$/public' -prune \) \
		-type f \
		\( -name '*.js' -or -name '*.jsx' \) \
)

FILES_SCSS := $(shell \
	find client assets \
		-type f \
		-name '*.scss' \
)

# git
GIT_BRANCH := $(shell git rev-parse --abbrev-ref HEAD)
GIT_HASH   := $(shell git rev-parse HEAD)

# node/npm helpers
NODE_ENV ?= development
NPM_BIN  := node_modules$/.bin$/
NODE     := $(shell which node)
NPM      := $(shell which npm)

# $(call npm-deps,package-a package-b package-c)
npm-deps = $(addprefix node_modules$/,$1) missing-modules

npm-shrinkwrap.json: clean-npm
	$(NPM) install && \
	$(NPM) shrinkwrap

.PHONY: missing-modules
missing-modules:
	$(RM) .make-cache$/missing-modules; \
  # Due to a bug in npm it's removing packages on install and
  # we can get in cycles where the installation of one package
  # removes another and then the installation of that other
  # package removes the first one - (╯°□°）╯︵ ┻━┻)
  # when resolved install only the required dependencies
	$(call when-not-empty,$(sort $(shell cat .make-cache$/missing-modules)),$(NPM) install)

.SECONDEXPANSION: node_modules
node_modules: DEPS = $(shell $(NODE) -e 'console.log(Object.keys(require(".$/package.json").dependencies).join(" "))')
node_modules: DEVS = $(shell $(NODE) -e 'console.log(Object.keys(require(".$/package.json").devDependencies).join(" "))')
node_modules: $$(call npm-deps,$$(DEPS) $$(DEVS))

# When installing here then we're probably running a
# build command like `eslint` and don't need to be
# _as_ stringent on updating when the `package.json`
# or `npm-shrinkwrap.json` files change
.SECONDARY: node_modules%
node_modules$/%:
	echo "$(notdir $@)" >> .make-cache$/missing-modules

# Optimizing phony targets that should
# only run when their dependencies change
BOOT := $(shell mkdir -p .make-cache)
TOUCH_CACHE = touch .make-cache$/
~ = $(strip $(TOUCH_CACHE))$(subst $/,-,$@)

vpath docker-image .make-cache
vpath lint-% .make-cache
vpath pre-commit .make-cache
vpath test-% .make-cache
vpath versions .make-cache

# Convenience utilities

list-op = $(shell comm $3 <(echo $1 | tr " " "\n") <(echo $2 | tr " " "\n"))
list-diff = $(call list-op,$1,$2,-23)
list-same = $(call list-op,$1,$2,-12)

# $(call when-less-than,min-size,default,list)
when-less-than = $(if $(shell [ $(words $3) -gt $1 ] && echo gt),$3,$2)

# $(call when-more-than,max-size,default,list)
when-more-than = $(if $(shell [ $(words $3) -lt $1 ] && echo lt),$3,$2)

# $(call when-not-empty,list,body)
when-not-empty = $(if $(shell [ $(words $1) -gt 0 ] && echo gt),$2,$3)

# Terminal
FG_BLUE    = \\033[34m
FG_CYAN    = \\033[36m
FG_GREEN   = \\033[32m
FG_RED     = \\033[31m
FG_RESET   = \\033[39m
TERM_RESET = \\033[0m

# Surprise
WELCOME=\
	H4sIAAAAAAAA/1VMQQ7AM\
	Ai6+wpuW5Nl/ZAJe4iPH9\
	hk6bRgQSKwFaOZhF+haIm\
	WbZucmfoID+rrg0jbJUIq\
	VDi50L0mB1J3Uv5A+ZQkh\
	YtKeCp163jJnt7NwL96o3\
	DEC1DrkHm8AAAA

# Reset make
.POSIX:
.SUFFIXES:
SHELL := bash
CONCURRENCY ?= -j6
UNQUIET ?= --quiet
UNQUIET :=
MAKEFLAGS += --no-builtin-rules $(CONCURRENCY) $(UNQUIET)
