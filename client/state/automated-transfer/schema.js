import { eligibility } from './eligibility/schema';

export const status = {
	type: 'number',
	minimum: 1,
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
