/**
 * Internal dependencies
 */
import { eligibility } from './eligibility/schema';
import { plugin } from './plugin/schema';
import { theme } from './theme/schema';

export const status = {
	type: [ 'string', 'null' ],
};

export const automatedTransferSite = {
	type: 'object',
	properties: {
		eligibility,
		plugin,
		status,
		theme,
	},
};

export const automatedTransfer = {
	type: 'object',
	patternProperties: {
		'^\\d+$': automatedTransferSite,
	},
};
