/**
 * What `yarn vite-check` lets through, each with the reason.
 */

const BROWSER_CONDITION =
	'Vite applies the `browser` export condition and webpack doesn’t; both builds work in a browser';
const IMPORT_AS_REQUIRE =
	'webpack’s `conditionNames` has `require` as well as `import`, so it takes the CommonJS build of the same version';
const REQUIRE_AS_IMPORT =
	'Vite takes the CommonJS build for `require()`, and webpack the ES module build of the same version';

export const allowed = {
	// Files where webpack-only code is guarded or deliberate.
	leftovers: {
		'client/components/async-load/index.tsx': '`require` is a prop',
		'client/sections-middleware.js': 'guarded by `typeof module`, for webpack hot reloading',
		'packages/create-calypso-config/src/index.ts': 'guarded by `typeof process`, for the server',
	},
	// `<Vite file> | <webpack file>` in one install, by package path.
	resolvedFiles: {
		'@base-ui/react/internals/prehydrationScript.stub.mjs | @base-ui/react/tabs/indicator/prehydrationScript.min.mjs':
			BROWSER_CONDITION,
		'@emotion/cache/dist/emotion-cache.browser.esm.js | @emotion/cache/dist/emotion-cache.esm.js':
			BROWSER_CONDITION,
		'@emotion/react/dist/emotion-react.browser.esm.js | @emotion/react/dist/emotion-react.esm.js':
			BROWSER_CONDITION,
		'@emotion/react/jsx-dev-runtime/dist/emotion-react-jsx-dev-runtime.browser.esm.js | @emotion/react/jsx-dev-runtime/dist/emotion-react-jsx-dev-runtime.esm.js':
			BROWSER_CONDITION,
		'@emotion/styled/dist/emotion-styled.browser.esm.js | @emotion/styled/dist/emotion-styled.esm.js':
			BROWSER_CONDITION,
		'@emotion/use-insertion-effect-with-fallbacks/dist/emotion-use-insertion-effect-with-fallbacks.browser.esm.js | @emotion/use-insertion-effect-with-fallbacks/dist/emotion-use-insertion-effect-with-fallbacks.esm.js':
			BROWSER_CONDITION,
		'@emotion/utils/dist/emotion-utils.browser.esm.js | @emotion/utils/dist/emotion-utils.esm.js':
			BROWSER_CONDITION,
		'@preact/signals-core/dist/signals-core.module.js | @preact/signals-core/dist/signals-core.mjs':
			BROWSER_CONDITION,
		'@tanstack/router-core/dist/esm/scroll-restoration-script/client.js | @tanstack/router-core/dist/esm/scroll-restoration-script/server.js':
			BROWSER_CONDITION,
		'decode-named-character-reference/index.dom.js | decode-named-character-reference/index.js':
			BROWSER_CONDITION,
		'parsel-js/dist/parsel.js | parsel-js/dist/parsel.min.js': BROWSER_CONDITION,
		'@date-fns/tz/index.js | @date-fns/tz/index.cjs': IMPORT_AS_REQUIRE,
		'@date-fns/utc/index.js | @date-fns/utc/index.cjs': IMPORT_AS_REQUIRE,
		'@github/webauthn-json/dist/esm/webauthn-json.js | @github/webauthn-json/dist/cjs/webauthn-json.cjs':
			IMPORT_AS_REQUIRE,
		'@stripe/react-stripe-js/dist/react-stripe.esm.mjs | @stripe/react-stripe-js/dist/react-stripe.js':
			IMPORT_AS_REQUIRE,
		'@vgs/collect-js-react/dist/index.mjs | @vgs/collect-js-react/dist/index.js': IMPORT_AS_REQUIRE,
		'date-fns-jalali/index.js | date-fns-jalali/index.cjs': IMPORT_AS_REQUIRE,
		'date-fns-jalali/locale.js | date-fns-jalali/locale.cjs': IMPORT_AS_REQUIRE,
		'date-fns/index.js | date-fns/index.cjs': IMPORT_AS_REQUIRE,
		'date-fns/locale.js | date-fns/locale.cjs': IMPORT_AS_REQUIRE,
		'entities/lib/esm/index.js | entities/lib/index.js': IMPORT_AS_REQUIRE,
		'framer-motion/dist/es/index.mjs | framer-motion/dist/cjs/index.js': IMPORT_AS_REQUIRE,
		'linkify-it/index.mjs | linkify-it/build/index.cjs.js': IMPORT_AS_REQUIRE,
		'mdurl/index.mjs | mdurl/build/index.cjs.js': IMPORT_AS_REQUIRE,
		'motion-dom/dist/es/index.mjs | motion-dom/dist/cjs/index.js': IMPORT_AS_REQUIRE,
		'motion-utils/dist/es/index.mjs | motion-utils/dist/cjs/index.js': IMPORT_AS_REQUIRE,
		'react-google-charts/dist/index.js | react-google-charts/dist/index.cjs': IMPORT_AS_REQUIRE,
		'react-intersection-observer/react-intersection-observer.modern.mjs | react-intersection-observer/react-intersection-observer.js':
			IMPORT_AS_REQUIRE,
		'react-use-measure/dist/index.js | react-use-measure/dist/index.cjs': IMPORT_AS_REQUIRE,
		'temml/dist/temml.mjs | temml/dist/temml.cjs': IMPORT_AS_REQUIRE,
		'uc.micro/index.mjs | uc.micro/build/index.cjs.js': IMPORT_AS_REQUIRE,
		'async-function/index.js | async-function/index.mjs': REQUIRE_AS_IMPORT,
		'async-generator-function/index.js | async-generator-function/index.mjs': REQUIRE_AS_IMPORT,
		'generator-function/index.js | generator-function/index.mjs': REQUIRE_AS_IMPORT,
		'inline-style-parser/cjs/index.js | inline-style-parser/esm/index.mjs': REQUIRE_AS_IMPORT,
		'redux/dist/cjs/redux.cjs | redux/dist/redux.mjs': REQUIRE_AS_IMPORT,
		'style-to-object/cjs/index.js | style-to-object/esm/index.mjs': REQUIRE_AS_IMPORT,
	},
	// Webpack files that become more than one module under Vite, by package path.
	duplicates: {
		'inline-style-parser/esm/index.mjs': 'only reached through `style-to-object`’s CommonJS build',
		'redux/dist/redux.mjs':
			'`redux-dynamic-middlewares` `require()`s the CommonJS build and only calls `compose()`, which keeps no state',
		'style-to-object/esm/index.mjs':
			'`style-to-js` `require()`s the CommonJS build, a pure function with no state',
	},
	// Package names first-party code imports at more than one version.
	collapses: {},
	// `<package path>: <finding>` in the pre-bundled dependencies.
	strictMode: {
		'js-base64/base64.js: assigns undeclared Base64': 'in a branch for Meteor only',
	},
};
