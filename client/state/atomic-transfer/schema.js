/**
 * Internal dependencies
 */

export const status = {
	type: [ 'string', 'null' ],
};

export const atomicTransfer = {
	type: 'object',
	properties: {
		status,
	},
};
