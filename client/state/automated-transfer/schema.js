/**
 * Internal dependencies
 */

import { eligibility } from './eligibility/schema';

export const status = {
	type: [ 'string', 'null' ],
};

export const automatedTransferSite = {
	type: 'object',
	properties: {
		eligibility,
		status,
	},
};

export const automatedTransfer = {
	type: 'object',
	patternProperties: {
		'^\\d+$': automatedTransferSite,
	},
};
