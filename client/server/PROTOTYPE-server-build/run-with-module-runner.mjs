// PROTOTYPE (DOTMSD-1670): variant (c), no server bundle in dev. Create a Vite server, then
// load client/server through its module runner. Throwaway.
//
//   CALYPSO_ENV=dashboard-development NODE_ENV=development \
//     node client/server/PROTOTYPE-server-build/run-with-module-runner.mjs
const t0 = performance.now();
const { createServer } = await import( 'vite' );
const { serverViteConfig, cjsShim } = await import( './vite.server.config.mjs' );
const tImport = performance.now();

const config = serverViteConfig();
config.plugins.push( cjsShim );
// The runner evaluates modules both bundlers tree-shake away (e.g. packages/agenttic-ui/dist), and
// some of their externals touch browser APIs at import time. Plugins can't stub SSR externals, so alias.
config.resolve.alias.unshift( {
	find: /^(@automattic\/charts|smooch)(\/.*)?$/,
	replacement: new URL( './stub-empty.mjs', import.meta.url ).pathname,
} );
const vite = await createServer( config );
const tCreate = performance.now();

await vite.ssrLoadModule( '/client/server/index.js' );
const tLoad = performance.now();

console.log(
	`[prototype] import vite ${ ( tImport - t0 ).toFixed( 0 ) }ms, createServer ${ (
		tCreate - tImport
	).toFixed( 0 ) }ms, ssrLoadModule ${ ( tLoad - tCreate ).toFixed( 0 ) }ms, modules ${
		vite.environments.ssr.moduleGraph.idToModuleMap.size
	}`
);
