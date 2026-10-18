import calypso, { nodeConfig } from '@automattic/calypso-eslint-config';

/** @type {import('eslint').Linter.Config[]} */
const config = [ ...calypso, nodeConfig ];

export default config;
