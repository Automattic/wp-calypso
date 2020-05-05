/**
 * Internal dependencies
 */
import GUTENBOARDING_BASE_NAME from './basename.json';

export const GUTENBOARDING_SECTION_DEFINITION = {
	name: 'gutenboarding',
	paths: [
		`/${ GUTENBOARDING_BASE_NAME }`,
		`/gutenboarding` /* Development path, maintained for redirection */,
	],
	module: 'gutenboarding',
	secondary: false,
	group: 'gutenboarding',
	enableLoggedOut: true,
};
