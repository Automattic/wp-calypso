// PROTOTYPE (DOTMSD-1675): build the dev Node server from the shared base + server overlay.
//   CALYPSO_ENV=dashboard-development NODE_ENV=development node build-tools/vite/PROTOTYPE-build-server.mjs
import { build } from 'vite';
import { devServerBuildConfig } from './server.mjs';

const t0 = performance.now();
await build( devServerBuildConfig() );
console.log( `[prototype] vite ssr build ${ ( performance.now() - t0 ).toFixed( 0 ) }ms` );
