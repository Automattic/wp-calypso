/**
 * External dependencies
 */
import page from 'page';
import { get } from 'lodash';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	SITE_ADDRESS_AVAILABILITY_REQUEST,
	SITE_ADDRESS_AVAILABILITY_SUCCESS,
	SITE_ADDRESS_AVAILABILITY_ERROR,
	SITE_ADDRESS_AVAILABILITY_ERROR_CLEAR,
	SITE_ADDRESS_CHANGE_REQUEST,
	SITE_ADDRESS_CHANGE_REQUEST_FAILURE,
	SITE_ADDRESS_CHANGE_REQUEST_SUCCESS,
} from 'state/action-types';
import { errorNotice, successNotice } from 'state/notices/actions';
import { recordTracksEvent } from 'state/analytics/actions';
import { domainManagementEdit } from 'my-sites/domains/paths';
import { requestSite } from 'state/sites/actions';
import { fetchSiteDomains } from 'state/sites/domains/actions';

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
) => ( dispatch ) => {
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

	const errorHandler = ( error ) => {
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
	};

	dispatch( recordTracksEvent( 'calypso_siteaddresschange_request', eventProperties ) );

	return fetchNonce( siteId )
		.then( ( nonce ) => {
			wpcom
				.undocumented()
				.updateSiteAddress( siteId, newBlogName, domain, oldDomain, siteType, discard, nonce )
				.then( ( data ) => {
					const newSlug = get( data, 'new_slug' );

					if ( newSlug ) {
						dispatch( recordTracksEvent( 'calypso_siteaddresschange_success', eventProperties ) );

						const newAddress = newSlug + '.' + domain;
						dispatch( requestSite( siteId ) ).then( () => {
							// Re-fetch domains, as we changed the primary domain name
							dispatch( fetchSiteDomains( siteId ) ).then( () =>
								page( domainManagementEdit( newAddress, newAddress ) )
							);

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
						} );
					}
				} )
				.catch( errorHandler );
		} )
		.catch( errorHandler );
};
