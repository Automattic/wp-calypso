import calypso, { browserGlobals } from '@automattic/calypso-eslint-config';

/** @type {import('eslint').Linter.Config[]} */
const config = [ ...calypso, { languageOptions: { globals: browserGlobals } } ];

export default config;
