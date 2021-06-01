/**
 * External dependencies
 */
import page from 'page';
import { get } from 'lodash';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';
import {
	SITE_ADDRESS_AVAILABILITY_REQUEST,
	SITE_ADDRESS_AVAILABILITY_SUCCESS,
	SITE_ADDRESS_AVAILABILITY_ERROR,
	SITE_ADDRESS_AVAILABILITY_ERROR_CLEAR,
	SITE_ADDRESS_CHANGE_REQUEST,
	SITE_ADDRESS_CHANGE_REQUEST_FAILURE,
	SITE_ADDRESS_CHANGE_REQUEST_SUCCESS,
} from 'calypso/state/action-types';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { domainManagementEdit } from 'calypso/my-sites/domains/paths';
import { requestSite } from 'calypso/state/sites/actions';
import { fetchSiteDomains } from 'calypso/state/sites/domains/actions';
import { getSiteSlug } from 'calypso/state/sites/selectors';

import 'calypso/state/site-address-change/init';

// @TODO proper redux data layer stuff for the nonce
function fetchNonce( siteId ) {
	return wpcom.undocumented().getRequestSiteAddressChangeNonce( siteId );
}

export const getErrorNotice = ( message ) =>
	errorNotice( message, {
		id: 'siteAddressChangeUnsuccessful',
		duration: 5000,
		showDismiss: true,
		isPersistent: true,
	} );

const dispatchErrorNotice = ( dispatch, error ) =>
	dispatch(
		getErrorNotice(
			error.message ||
				translate( 'Sorry, we were unable to change your site address. Please try again.' )
		)
	);

export const requestSiteAddressAvailability = (
	siteId,
	siteAddress,
	domain,
	siteType,
	testBool
) => ( dispatch ) => {
	dispatch( {
		type: SITE_ADDRESS_AVAILABILITY_REQUEST,
		siteId,
		siteAddress,
	} );

	return wpcom
		.undocumented()
		.checkSiteAddressValidation( siteId, siteAddress, domain, siteType, testBool )
		.then( ( data ) => {
			const errorType = get( data, 'error' );
			const message = get( data, 'message' );

			if ( errorType ) {
				dispatch( {
					type: SITE_ADDRESS_AVAILABILITY_ERROR,
					siteId,
					errorType,
					message,
				} );

				return;
			}

			dispatch( {
				type: SITE_ADDRESS_AVAILABILITY_SUCCESS,
				siteId,
				siteAddress,
			} );
		} )
		.catch( ( error ) => {
			const errorType = get( error, 'error' );
			const message = get( error, 'message' );

			dispatch( {
				type: SITE_ADDRESS_AVAILABILITY_ERROR,
				siteId,
				errorType,
				message,
			} );
		} );
};

export const clearValidationError = ( siteId ) => ( dispatch ) => {
	dispatch( {
		type: SITE_ADDRESS_AVAILABILITY_ERROR_CLEAR,
		siteId,
	} );
};

export const requestSiteAddressChange = (
	siteId,
	newBlogName,
	domain,
	oldDomain,
	siteType,
	discard = true
) => async ( dispatch, getState ) => {
	dispatch( {
		type: SITE_ADDRESS_CHANGE_REQUEST,
		siteId,
	} );

	const eventProperties = {
		blog_id: siteId,
		new_domain: newBlogName,
		domain,
		old_domain: oldDomain,
		site_type: siteType,
		discard,
	};

	dispatch( recordTracksEvent( 'calypso_siteaddresschange_request', eventProperties ) );

	try {
		const nonce = await fetchNonce( siteId );
		const data = await wpcom
			.undocumented()
			.updateSiteAddress( siteId, newBlogName, domain, oldDomain, siteType, discard, nonce );

		const newSlug = get( data, 'new_slug' );

		if ( newSlug ) {
			dispatch( recordTracksEvent( 'calypso_siteaddresschange_success', eventProperties ) );

			await dispatch( requestSite( siteId ) );
			// Re-fetch domains, as we changed the primary domain name
			await dispatch( fetchSiteDomains( siteId ) );

			dispatch( {
				type: SITE_ADDRESS_CHANGE_REQUEST_SUCCESS,
				siteId,
			} );

			dispatch(
				successNotice( translate( 'Your new site address is ready to go!' ), {
					id: 'siteAddressChangeSuccessful',
					duration: 5000,
					showDismiss: true,
					isPersistent: true,
				} )
			);

			// site slug, potentially freshly updated by the `requestSite` above
			const siteSlug = getSiteSlug( getState(), siteId );
			// new name of the `*.wordpress.com` domain that we just changed
			const newDomain = newSlug + '.' + domain;
			page( domainManagementEdit( siteSlug, newDomain ) );
		}
	} catch ( error ) {
		dispatch(
			recordTracksEvent( 'calypso_siteaddresschange_error', {
				...eventProperties,
				error_code: error.code,
			} )
		);
		dispatchErrorNotice( dispatch, error );
		dispatch( {
			type: SITE_ADDRESS_CHANGE_REQUEST_FAILURE,
			error: error.message,
			siteId,
		} );
	}
};
