include Makefile-utils.mk

#
# Calypso
#
.PHONY: pre-start
pre-start: welcome versions

versions: B = $(FG_BLUE)
versions: R = $(FG_RED)
versions: Z = $(FG_RESET)
versions: PATTERN = ^v*\([0-9]*\)\(.*\)
versions: MAJOR = `$1 | sed -n 's/$(PATTERN)/\1/p'`
versions: COLOR = `$2 | sed -n 's/$(PATTERN)/\$1\1\$Z\2/p'`
versions: CHECK = @\
	export BASE=$($2); \
	export JSON=`$(NODE) -e 'console.log(require(".$/package.json").engines.$1)'`; \
	export WMAJ=$(call MAJOR,echo $$JSON); \
	export HMAJ=$(call MAJOR,$$BASE -v); \
	export WANT=$(call COLOR,$R,echo $$JSON); \
	export HAVE=$(call COLOR,$B,$$BASE -v); \
	[ $$WMAJ != $$HMAJ ] && echo -e "$Rx$Z need $1 major version $$WANT but have $$HAVE instead" && exit 1 || exit 0
versions: $(NODE) $(NPM)
	$(call CHECK,node,NODE)
	$(call CHECK,npm,NPM)
	$~

.PHONY: welcome
welcome:
	@echo -e "$(FG_CYAN)"; echo $(WELCOME) | base64 -D | gzip -d; echo -e "$(TERM_RESET)"

calypso-strings.pot: $(FILES_JS)
	$(NPM_BIN)i18n-calypso --format pot --output-file ./calypso-strings.pot -e date "**/*.js" "**/*.jsx" "!build/**" "!node_modules/**" "!public/**"
	$~

#
# Docker
#
docker-image: Dockerfile Makefile Makefile-utils.mk assets bin client config docs public server test $(filter %.js %.json %.sh,$(wildcard *))
	docker build --build-arg commit_sha=$(GIT_HASH) -t wp-calypso .
	$~

.PHONY: docker
docker: docker-image
	docker run -it --name wp-calypso --rm -p 80:3000 wp-calypso

#
# Linting
#
.PHONY: lint
lint: lint-config lint-css lint-js

lint-config: config
	$(NODE) server$/config$/validate-config-keys.js
	$~

lint-css: CHANGED = $(filter %.scss,$?)
lint-css: ARGS = $(call when-more-than,100,client$/**$/*.scss,$(CHANGED))
lint-css: $(FILES_SCSS) | $(call npm-deps,stylelint)
	$(NPM_BIN)stylelint --syntax scss $(ARGS)
	$~

lint-js: CHANGED = $(filter %.js %.jsx,$?)
lint-js: ARGS = $(call when-more-than,100,.,$(CHANGED))
lint-js: $(FILES_JS) | $(call npm-deps,eslint-eslines)
	$(NPM_BIN)eslint-eslines $(ARGS)
	$~

#
# Testing
#
.PHONY: test
test: test-client test-server

.PHONY: test-client
test-client: $(FILES_JS) | $(call npm-deps,jest)
	$(NPM_BIN)jest -c=test/client/jest.config.json
	$~

.PHONY: test-server
test-server: $(FILES_JS) | $(call npm-deps,jest)
	$(NPM_BIN)jest -c=test/server/jest.config.json
	$~

#
# Git
#
.PHONY: pre-push
pre-push: | contribution-message
  ifeq (master,$(GIT_BRANCH))
	read -n 1 -p "You're about to push !!![ $(GIT_BRANCH) ]!!!, is that what you intended? " CONFIRM; \
	echo; \
	if [[ ! $$CONFIRM =~ ^[Yy]$$ ]]; then exit 1; fi
  endif

.PHONY: pre-commit
.SECONDEXPANSION: pre-commit
pre-commit: DIRTY = $(sort $(filter %.js %.jsx %.scss,$(shell git diff $1 --name-only --diff-filter=ACM)))
pre-commit: READY = $(call list-diff,$(call DIRTY,--cached),$(DIRTY))
pre-commit: NEWER = $(call list-same,$(sort $?),$(READY))
pre-commit: FILES = $(call when-more-than,0,$(READY),$(NEWER))
pre-commit: lint-config $$(READY) | $(call npm-deps,eslint-eslines prettier) contribution-message
	$(call when-not-empty,$(NEWER), \
		$(info Formatting unmodified files staged for commit) \
		$(NPM_BIN)prettier --require-pragma --write $(FILES) && \
			git add $(FILES) && \
			$(NPM_BIN)eslint-eslints --diff=index $(filter-out %.scss,$(FILES)) \
	)
	$~

.PHONY: contribution-message
contribution-message:
	$(info By contributing to this project, you license the materials you contribute)
	$(info under the GNU General Public License v2 (or later). All materials must have)
	$(info GPLv2 compatible licenses — see .github/CONTRIBUTING.md for details.)
	$(info )

#
# Cleaning
#
.PHONY: clean
clean: clean-build clean-devdocs clean-public

.PHONY: clean-build
clean-build:
	$(RM) build server$/bundler$/*.json .babel-cache

.PHONY: clean-devdocs
clean-devdocs:
	$(RM) $(addprefix server$/devdocs$/,search-index.js prototypes-index.json components-usage-stats.json)

.PHONY: clean-npm
clean-npm:
	$(RM) node_modules npm-shrinkwrap.json

.PHONY: clean-public
clean-public:
	$(RM) \
		$(addprefix public$/*.,css css.map js js.map) \
		$(addprefix public$/sections$/*.,css css.map) \
		$(addprefix public$/sections-rtl$/*.,css css.map)

.PHONY: distclean
distclean: clean
	$(RM) node_modules .make-cache
