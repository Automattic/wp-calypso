export const itemsSchema = {
	type: 'object',
	additionalProperties: false,
	patternProperties: {
		'^\\d+$': {
			type: 'array',
			items: {
				type: 'object',
				required: [ 'domain' ],
				properties: {
					autoRenewalDate: { type: 'string' },
					autoRenewing: { type: 'boolean' },
					blogId: { type: 'number' },
					canSetAsPrimary: { type: 'boolean' },
					currentUserCanManage: { type: 'boolean' },
					domain: { type: 'string' },
					expired: { type: 'boolean' },
					expiry: { type: [ 'null', 'string' ] },
					expirySoon: { type: 'boolean' },
					googleAppsSubscription: { type: 'object' },
					hasPrivacyProtection: { type: 'boolean' },
					hasRegistration: { type: 'boolean' },
					hasZone: { type: 'boolean' },
					isPendingIcannVerification: { type: 'boolean' },
					isPrimary: { type: 'boolean' },
					isPrivate: { type: 'boolean' },
					isWPCOMDomain: { type: 'boolean' },
					manualTransferRequired: { type: 'boolean' },
					newRegistration: { type: 'boolean' },
					name: { type: 'string' },
					owner: { type: 'string', optional: true },
					partnerDomain: { type: 'boolean' },
					pendingRegistration: { type: 'boolean' },
					pendingRegistrationTime: { type: 'string' },
					pointsToWpcom: { type: 'boolean' },
					registrar: { type: 'string' },
					registrationDate: { type: 'string' },
					type: { type: 'string' }
				}
			}
		}
	}
};
