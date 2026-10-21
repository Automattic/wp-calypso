import 'calypso/state/memberships/init';

export function getIsConnectedForSiteId( state, siteId ) {
	return state?.memberships?.settings?.[ siteId ]?.isConnected ?? false;
}

export function getConnectedAccountDescriptionForSiteId( state, siteId ) {
	return state?.memberships?.settings?.[ siteId ]?.connectedAccountDescription ?? null;
}

export function getconnectedAccountDefaultCurrencyForSiteId( state, siteId ) {
	return state?.memberships?.settings?.[ siteId ]?.connectedAccountDefaultCurrency ?? null;
}
export function getconnectedAccountMinimumCurrencyForSiteId( state, siteId ) {
	return state?.memberships?.settings?.[ siteId ]?.connectedAccountMinimumCurrency ?? null;
}
export function getMembershipsSandboxStatusForSiteId( state, siteId ) {
	return state?.memberships?.settings?.[ siteId ]?.membershipsSandboxStatus ?? null;
}
export function getConnectUrlForSiteId( state, siteId ) {
	// Fall back only when the value is absent, not when it is a terminal null.
	const connectUrl = state?.memberships?.settings?.[ siteId ]?.connectUrl;
	return connectUrl === undefined ? '' : connectUrl;
}

export function getCouponsAndGiftsEnabledForSiteId( state, siteId ) {
	return state?.memberships?.settings?.[ siteId ]?.couponsAndGiftsEnabled ?? null;
}
