import path from 'node:path';

export const root = path.resolve( import.meta.dirname, '../..' );
export const client = path.join( root, 'client' );

// Workspace packages publish their source under this export condition.
export const CALYPSO_SRC = 'calypso:src';

/** @returns {import('vite').UserConfig} */
export function calypsoBase() {
	return {
		root,
		oxc: {
			jsx: { runtime: 'automatic', importSource: '@emotion/react' },
		},
		define: {
			__i18n_text_domain__: JSON.stringify( 'default' ),
		},
		resolve: {
			alias: [ { find: /^calypso\//, replacement: client + '/' } ],
		},
	};
}
