import {
	find,
	matches,
	some,
} from 'lodash';

export function isRequestingGuidedTransferStatus( state, siteId ) {
	return state.sites.guidedTransfer.isFetching[ siteId ] === true;
}

export function isGuidedTransferInProgress( state, siteId ) {
	const status = state.sites.guidedTransfer.status[ siteId ];
	if ( ! status ) {
		return false;
	}

	return status.upgrade_purchased &&
		status.host_details_entered;
}

/**
 * Returns true if the user has initiated a guided transfer, but
 * we're still waiting for them to purchase the GT
 *
 * @param {Object} state The Redux state object
 * @param {number} siteId The siteId to check
 * @return {bool} true if guided transfer is awaiting purchase
 */
export function isGuidedTransferAwaitingPurchase( state, siteId ) {
	const status = state.sites.guidedTransfer.status[ siteId ];
	if ( ! status ) {
		return false;
	}

	return ( ! status.upgrade_purchased ) &&
		status.host_details_entered;
}

export function getGuidedTransferIssues( state, siteId ) {
	const gt = state.sites.guidedTransfer.status[ siteId ];
	if ( ! gt ) {
		return null;
	}

	return gt.issues;
}

/**
 * Returns true as long as there are no issues completely preventing a
 * Guided Transfer for a site from continuing.
 *
 * @param {any} state   The Redux store state
 * @param {any} siteId  The site ID to check
 * @returns {bool} true if the site is confirmed eligible for transfer, false otherwise
 */
export function isEligibleForGuidedTransfer( state, siteId ) {
	const issues = getGuidedTransferIssues( state, siteId );
	if ( issues === null ) {
		// No information available
		return false;
	}

	return ! some( issues, issue => issue.prevents_transfer );
}

export function getGuidedTransferIssue( state, siteId, options = {} ) {
	const issues = getGuidedTransferIssues( state, siteId );
	if ( issues === null ) {
		// No information available
		return false;
	}

	return find( issues, matches( options ) ) || null;
}

/**
 * Returns true as long as there are no issues preventing a transfer
 * on *all* sites. Does not check site-specific issues. Currently
 * requires a siteId as the issues list is fetched from a site specific
 * endpoint.
 *
 * @param {any} state   The Redux store state
 * @param {any} siteId  The site ID to check
 * @returns {bool} true if the site is confirmed eligible for transfer, false otherwise
 */
export function isGuidedTransferAvailableForAllSites( state, siteId ) {
	const issues = getGuidedTransferIssues( state, siteId );
	if ( issues === null ) {
		// No information available
		return false;
	}

	return ! some( issues, issue => {
		return issue.reason === 'unavailable' || issue.reason === 'vacation';
	} );
}

export function isGuidedTransferSavingHostDetails( state, siteId ) {
	const status = state.sites.guidedTransfer.isSaving[ siteId ];
	return !! status;
}
