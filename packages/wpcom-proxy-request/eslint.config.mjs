import calypso, { nodeConfig } from '@automattic/calypso-eslint-config';

/** @type {import('eslint').Linter.Config[]} */
const config = [ ...calypso( import.meta.dirname ), { ...nodeConfig, files: [ 'test/**' ] } ];

export default config;
