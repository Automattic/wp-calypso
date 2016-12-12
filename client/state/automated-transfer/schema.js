import { eligibility } from './eligibility/schema';

export const status = {
	type: 'string',
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
