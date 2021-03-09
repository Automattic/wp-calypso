/**
 * Internal dependencies
 */

export const toggleWhatsNew = () =>
	( {
		type: 'TOGGLE_FEATURE',
	} as const );

export type Action = ReturnType< typeof toggleWhatsNew >;
