export const getRestrictedTldQueryData = ( tld ) => {
	// see p2-pYObb-ne and p2-pau2Xa-4tC
	if ( tld === 'link' ) {
		return {
			promoTlds: [ tld ],
			otherManagedSubdomains: [ tld ],
			otherManagedSubdomainsCountOverride: 2,
		};
	}

	return {};
};
