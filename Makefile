SINGLE_QUOTE := '
# We need to escape single quote as '\''
THIS_DIR := '$(subst $(SINGLE_QUOTE),$(SINGLE_QUOTE)\$(SINGLE_QUOTE)$(SINGLE_QUOTE),$(CURDIR))'

ifeq ($(OS),Windows_NT)
SEPARATOR := ;
else
SEPARATOR := :
endif

# BIN
BIN := $(THIS_DIR)/bin

# NODE BIN folder
NODE_BIN := $(THIS_DIR)/node_modules/.bin

# applications
NODE ?= node
NPM ?= npm
BUNDLER ?= $(BIN)/bundler
I18N_CALYPSO ?= $(NODE_BIN)/i18n-calypso
SASS ?= $(NODE_BIN)/node-sass --include-path 'client' --include-path 'build'
RTLCSS ?= $(NODE_BIN)/rtlcss
AUTOPREFIXER ?= $(NODE_BIN)/postcss -r --use autoprefixer --autoprefixer.browsers "last 2 versions, > 1%, Safari >= 8, iOS >= 8, Firefox ESR, Opera 12.1"
RECORD_ENV ?= $(BIN)/record-env
ALL_DEVDOCS_JS ?= server/devdocs/bin/generate-devdocs-index
COMPONENTS_USAGE_STATS_JS ?= server/devdocs/bin/generate-components-usage-stats.js

# hash command
MD5SUM_EXISTS := $(shell command -v md5sum 2> /dev/null)
ifndef MD5SUM_EXISTS
HASH := md5
else
HASH := md5sum
endif

# files used as prereqs
SASS_FILES := $(shell \
	find client assets \
		-type f \
		-name '*.scss' \
)
JS_FILES := $(shell \
	find . \
		-not \( -path './.git' -prune \) \
		-not \( -path './build' -prune \) \
		-not \( -path './node_modules' -prune \) \
		-not \( -path './public' -prune \) \
		-type f \
		\( -name '*.js' -or -name '*.jsx' \) \
)
MD_FILES := $(shell \
	find . \
		-not \( -path './.git' -prune \) \
		-not \( -path './build' -prune \) \
		-not \( -path './node_modules' -prune \) \
		-not \( -path './public' -prune \) \
		-type f \
		-name '*.md' \
	| sed 's/ /\\ /g' \
)
COMPONENTS_USAGE_STATS_FILES = $(shell \
	find client \
		-not \( -path '*/docs/*' -prune \) \
		-not \( -path '*/test/*' -prune \) \
		-not \( -path '*/docs-example/*' -prune \) \
		-type f \
		\( -name '*.js' -or -name '*.jsx' \) \
)
CLIENT_CONFIG_FILE := client/config/index.js

CLIENT_STYLE_FILES = $(shell \
	find client \
		-type f \
		-name 'style.scss' \
)
CLIENT_STYLE_FILES_HASH = $(shell echo $(CLIENT_STYLE_FILES) | $(HASH)).hash

# variables
NODE_ENV ?= development
CALYPSO_ENV ?= $(NODE_ENV)

export NODE_ENV := $(NODE_ENV)
export CALYPSO_ENV := $(CALYPSO_ENV)
export NODE_PATH := server$(SEPARATOR)client$(SEPARATOR).

.DEFAULT_GOAL := install

welcome:
	@printf "\033[36m             _                           \n"
	@printf "\033[36m    ___ __ _| |_   _ _ __  ___  ___      \n"
	@printf "\033[36m   / __/ _\` | | | | | '_ \/ __|/ _ \\   \n"
	@printf "\033[36m  | (_| (_| | | |_| | |_) \__ \ (_) |    \n"
	@printf "\033[36m   \___\__,_|_|\__, | .__/|___/\___/     \n"
	@printf "\033[36m               |___/|_|                  \n"
	@printf "\033[m\n"

install: node_modules

# Simply running `make run` will spawn the Node.js server instance.
run: welcome githooks install build
	@$(NODE) build/bundle-$(CALYPSO_ENV).js

dashboard: install
	@$(NODE_BIN)/webpack-dashboard -- make run

# a helper rule to ensure that a specific module is installed,
# without relying on a generic `npm install` command
node_modules/%:
	@$(NPM) install $(notdir $@)

node-version: node_modules/semver
	@$(BIN)/check-node-version

# ensures that the `node_modules` directory is installed and up-to-date with
# the dependencies listed in the "package.json" file.
node_modules: package.json | node-version
	@$(NPM) prune
	@$(NPM) install
	@touch node_modules

test: build
	@$(NPM) test

lint: node_modules/eslint node_modules/eslint-plugin-react node_modules/babel-eslint mixedindentlint
	@$(NPM) run lint

eslint: lint

eslint-branch: node_modules/eslint node_modules/eslint-plugin-react node_modules/babel-eslint
	@git diff --name-only $$(git merge-base $$(git rev-parse --abbrev-ref HEAD) master)..HEAD | grep '\.jsx\?$$' | xargs $(NODE_BIN)/eslint --cache

# Skip files that are auto-generated
mixedindentlint: node_modules/mixedindentlint
	@echo "$(JS_FILES)\n$(SASS_FILES)" | xargs $(NODE_BIN)/mixedindentlint --ignore-comments --exclude="client/config/index.js" --exclude="client/components/gridicon/index.jsx"

# keep track of the current CALYPSO_ENV so that it can be used as a
# prerequisite for other rules
.env: FORCE
	@$(RECORD_ENV) $@

# generate the client-side `config` js file
$(CLIENT_CONFIG_FILE): .env config/$(CALYPSO_ENV).json config/client.json server/config/regenerate-client.js
	@$(NODE) server/config/regenerate-client.js > $@

build/$(CLIENT_STYLE_FILES_HASH):
	@rm -f build/*.hash
	@touch build/$(CLIENT_STYLE_FILES_HASH)

build/_components.scss: build/$(CLIENT_STYLE_FILES_HASH)
	@mkdir -p build
	@echo "$(CLIENT_STYLE_FILES)" | tr " " "\n" | sed "s/^client\//@import '/; s/$$/';/ ; s/\.scss//" > $@

public/style-rtl.css: public/style.css

public/style.css: node_modules $(SASS_FILES) build/_components.scss
	@$(SASS) assets/stylesheets/style.scss $@
	@$(AUTOPREFIXER) $@

public/style-debug.css: node_modules $(SASS_FILES) build/_components.scss
	@$(SASS) --source-map "$(@D)/style-debug.css.map" assets/stylesheets/style.scss $@
	@$(AUTOPREFIXER) $@

public/style-rtl.css: public/style.css
	@$(RTLCSS) $(THIS_DIR)/public/style.css $@

public/editor.css: node_modules $(SASS_FILES)
	@$(SASS) assets/stylesheets/editor.scss $@
	@$(AUTOPREFIXER) $@

server/devdocs/search-index.js: $(MD_FILES) $(ALL_DEVDOCS_JS)
	@$(ALL_DEVDOCS_JS) $(MD_FILES)

server/devdocs/components-usage-stats.json: $(COMPONENTS_USAGE_STATS_FILES) $(COMPONENTS_USAGE_STATS_JS)
	@$(COMPONENTS_USAGE_STATS_JS) $(COMPONENTS_USAGE_STATS_FILES)

build-dll: node_modules
	@mkdir -p build
	@CALYPSO_ENV=$(CALYPSO_ENV) $(NODE_BIN)/webpack --display-error-details --config webpack-dll.config.js

build-server: install
	@mkdir -p build
	@CALYPSO_ENV=$(CALYPSO_ENV) $(NODE_BIN)/webpack --display-error-details --config webpack.config.node.js

build: install build-$(CALYPSO_ENV)

build-css: public/style.css public/style-rtl.css public/style-debug.css public/editor.css

build-development: server/devdocs/components-usage-stats.json build-server build-dll $(CLIENT_CONFIG_FILE) server/devdocs/search-index.js build-css

build-wpcalypso: server/devdocs/components-usage-stats.json build-server build-dll $(CLIENT_CONFIG_FILE) server/devdocs/search-index.js build-css
	@$(BUNDLER)

build-horizon build-stage build-production: build-server build-dll $(CLIENT_CONFIG_FILE) build-css
	@$(BUNDLER)

build-desktop build-desktop-mac-app-store: build-server $(CLIENT_CONFIG_FILE) build-css
	@$(BUNDLER)

# the `clean` rule deletes all the files created from `make build`, but not
# those created by `make install`
clean:
	@rm -rf public/style*.css public/style-debug.css.map public/*.js $(CLIENT_CONFIG_FILE) server/devdocs/search-index.js server/devdocs/components-usage-stats.json public/editor.css build/* server/bundler/*.json .babel-cache

# the `distclean` rule deletes all the files created from `make install`
distclean: clean
	@rm -rf node_modules

# create list of translations, saved as `./calypso-strings.pot`
translate: node_modules $(CLIENT_CONFIG_FILE)
	$(I18N_CALYPSO) --format pot --output-file ./calypso-strings.pot $(JS_FILES)

# install all git hooks
githooks: githooks-commit githooks-push

# install git pre-commit hook
githooks-commit:
	@if [ ! -e .git/hooks/pre-commit ]; then ln -s ../../bin/pre-commit .git/hooks/pre-commit; fi

# install git pre-push hook
githooks-push:
	@if [ ! -e .git/hooks/pre-push ]; then ln -s ../../bin/pre-push .git/hooks/pre-push; fi

# generate a new shrinkwrap
shrinkwrap: node-version
	@! lsof -Pi :3000 -sTCP:LISTEN -t || ( echo "Please stop your Calypso instance running on port 3000 and try again." && exit 1 )
	@type shonkwrap || ( echo "Please install shonkwrap globally and try again: 'npm install -g shonkwrap'" && exit 1 )
	@rm -rf node_modules
	@rm -f npm-shrinkwrap.json
	@$(NPM) install --no-optional
	@$(NPM) install --no-optional # remove this when this is fixed in npm 3
	@shonkwrap --dev

# rule that can be used as a prerequisite for other rules to force them to always run
FORCE:

.PHONY: build build-development build-server build-dll build-desktop build-desktop-mac-app-store build-horizon build-stage build-production build-wpcalypso
.PHONY: run install test clean distclean translate route node-version
.PHONY: githooks githooks-commit githooks-push
