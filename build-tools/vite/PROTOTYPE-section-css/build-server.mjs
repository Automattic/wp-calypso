// Vite SSR build of the dev Node server for CALYPSO_ENV=development, to build/server-vite-dev.cjs.
import { build } from 'vite';
import { devServerBuildConfig } from '../server.mjs';
const cfg = devServerBuildConfig();
cfg.build.rolldownOptions.output.entryFileNames = 'server-vite-dev.cjs';
cfg.cacheDir = cfg.cacheDir + '-dev';
const t0 = performance.now();
await build( cfg );
console.log( `[1681] vite ssr build ${ ( performance.now() - t0 ).toFixed( 0 ) }ms` );
