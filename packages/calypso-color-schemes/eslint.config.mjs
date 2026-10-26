import calypso, { nodeConfig } from '@automattic/calypso-eslint-config';
import { defineConfig } from 'eslint/config';

export default defineConfig( [
	...calypso( import.meta.dirname ),
	{ ...nodeConfig, files: [ 'bin/**' ] },
] );
