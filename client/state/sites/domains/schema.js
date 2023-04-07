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
					aftermarketAuction: { type: 'boolean' },
					autoRenewalDate: { type: 'string' },
					autoRenewing: { type: 'boolean' },
					blogId: { type: 'number' },
					canSetAsPrimary: { type: 'boolean' },
					currentUserCanManage: { type: 'boolean' },
					canManageDnsRecords: { type: 'boolean' },
					canManageNameServers: { type: 'boolean' },
					canUpdateContactInfo: { type: 'boolean' },
					cannotManageDnsRecordsReason: { type: [ 'null', 'string' ] },
					cannotManageNameServersReason: { type: [ 'null', 'string' ] },
					cannotUpdateContactInfoReason: { type: [ 'null', 'string' ] },
					domain: { type: 'string' },
					expired: { type: 'boolean' },
					expiry: { type: [ 'null', 'string' ] },
					expirySoon: { type: 'boolean' },
					googleAppsSubscription: { type: 'object' },
					titanMailSubscription: { type: 'object' },
					hasRegistration: { type: 'boolean' },
					hasWpcomNameservers: { type: 'boolean' },
					hasZone: { type: 'boolean' },
					isPendingIcannVerification: { type: 'boolean' },
					isPendingRenewal: { type: 'boolean' },
					isPremium: { type: 'boolean' },
					isPrimary: { type: 'boolean' },
					isSubdomain: { type: 'boolean' },
					isWPCOMDomain: { type: 'boolean' },
					manualTransferRequired: { type: 'boolean' },
					name: { type: 'string' },
					nominetDomainSuspended: { type: 'boolean' },
					nominetPendingContactVerificationRequest: { type: 'boolean' },
					owner: { type: 'string', optional: true },
					partnerDomain: { type: 'boolean' },
					pendingRegistration: { type: 'boolean' },
					pendingRegistrationTime: { type: 'string' },
					pointsToWpcom: { type: 'boolean' },
					registrar: { type: 'string' },
					registrationDate: { type: 'string' },
					subscriptionId: { type: [ 'null', 'string' ] },
					supportsDomainConnect: { type: 'boolean', optional: true },
					supportsGdprConsentManagement: { type: 'boolean', optional: true },
					type: { type: 'string' },
					transferStartDate: { type: [ 'null', 'string' ] },
					transferEndDate: { type: [ 'null', 'string' ] },
				},
			},
		},
	},
};
