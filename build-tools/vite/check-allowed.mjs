/**
 * What `yarn vite-check` lets through, each with the reason.
 */

const BROWSER_CONDITION =
	'Vite applies the `browser` export condition and webpack doesn’t; both builds work in a browser';
const IMPORT_AS_REQUIRE =
	'webpack’s `conditionNames` has `require` as well as `import`, so it takes the CommonJS build of the same version';

export const allowed = {
	// Files where webpack-only code is guarded or deliberate.
	leftovers: {
		'client/components/async-load/index.tsx': '`require` is a prop',
		'client/sections-middleware.js': 'guarded by `typeof module`, for webpack hot reloading',
		'packages/create-calypso-config/src/index.ts': 'guarded by `typeof process`, for the server',
	},
	// `<Vite file> | <webpack file>` in one install, by package path.
	resolvedFiles: {
		'@emotion/cache/dist/emotion-cache.browser.esm.js | @emotion/cache/dist/emotion-cache.esm.js':
			BROWSER_CONDITION,
		'@emotion/react/dist/emotion-react.browser.esm.js | @emotion/react/dist/emotion-react.esm.js':
			BROWSER_CONDITION,
		'@emotion/react/jsx-dev-runtime/dist/emotion-react-jsx-dev-runtime.browser.esm.js | @emotion/react/jsx-dev-runtime/dist/emotion-react-jsx-dev-runtime.esm.js':
			BROWSER_CONDITION,
		'@emotion/styled/dist/emotion-styled.browser.esm.js | @emotion/styled/dist/emotion-styled.esm.js':
			BROWSER_CONDITION,
		'@date-fns/tz/index.js | @date-fns/tz/index.cjs': IMPORT_AS_REQUIRE,
		'@github/webauthn-json/dist/esm/webauthn-json.js | @github/webauthn-json/dist/cjs/webauthn-json.cjs':
			IMPORT_AS_REQUIRE,
		'@stripe/react-stripe-js/dist/react-stripe.esm.mjs | @stripe/react-stripe-js/dist/react-stripe.js':
			IMPORT_AS_REQUIRE,
		'@vgs/collect-js-react/dist/index.mjs | @vgs/collect-js-react/dist/index.js': IMPORT_AS_REQUIRE,
		'date-fns/index.js | date-fns/index.cjs': IMPORT_AS_REQUIRE,
		'framer-motion/dist/es/index.mjs | framer-motion/dist/cjs/index.js': IMPORT_AS_REQUIRE,
		'react-intersection-observer/react-intersection-observer.modern.mjs | react-intersection-observer/react-intersection-observer.js':
			IMPORT_AS_REQUIRE,
	},
	// Webpack files that become more than one module under Vite, by package path.
	duplicates: {},
	// Package names first-party code imports at more than one version.
	collapses: {},
};
