/** @format */
/**
 * External dependencies
 */
import page from 'page';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	SITE_ADDRESS_AVAILABILITY_REQUEST,
	SITE_ADDRESS_AVAILABILITY_SUCCESS,
	SITE_ADDRESS_AVAILABILITY_ERROR,
	SITE_ADDRESS_AVAILABILITY_ERROR_CLEAR,
	SITE_RENAME_REQUEST,
	SITE_RENAME_REQUEST_FAILURE,
	SITE_RENAME_REQUEST_SUCCESS,
} from 'state/action-types';
import { errorNotice, successNotice } from 'state/notices/actions';
import { recordTracksEvent } from 'state/analytics/actions';
import { domainManagementEdit } from 'my-sites/domains/paths';
import { requestSite } from 'state/sites/actions';

// @TODO proper redux data layer stuff for the nonce
function fetchNonce( siteId ) {
	return wpcom.undocumented().getSiteAddressChangeNonce( siteId );
}

export const getErrorNotice = message =>
	errorNotice( message, {
		id: 'siteRenameUnsuccessful',
		duration: 5000,
		showDismiss: true,
		isPersistent: true,
	} );

const dispatchErrorNotice = ( dispatch, error ) =>
	dispatch(
		getErrorNotice(
			// @TODO translate copy once finalised
			error.message || 'Sorry, we were unable to complete your domain change. Please try again.'
		)
	);

export const requestSiteAddressAvailability = ( siteId, siteAddress, testBool ) => dispatch => {
	dispatch( {
		type: SITE_ADDRESS_AVAILABILITY_REQUEST,
		siteId,
		siteAddress,
	} );

	return wpcom
		.undocumented()
		.checkSiteAddressValidation( siteId, siteAddress, testBool )
		.then( data => {
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
		.catch( error => {
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

export const clearValidationError = siteId => dispatch => {
	dispatch( {
		type: SITE_ADDRESS_AVAILABILITY_ERROR_CLEAR,
		siteId,
	} );
};

export const requestSiteRename = ( siteId, newBlogName, discard ) => dispatch => {
	dispatch( {
		type: SITE_RENAME_REQUEST,
		siteId,
	} );

	const eventProperties = {
		new_domain: newBlogName,
		discard,
	};

	const errorHandler = error => {
		dispatch(
			recordTracksEvent( 'calypso_siterename_error', {
				...eventProperties,
				error_code: error.code,
			} )
		);
		dispatchErrorNotice( dispatch, error );
		dispatch( {
			type: SITE_RENAME_REQUEST_FAILURE,
			error: error.message,
			siteId,
		} );
	};

	dispatch( recordTracksEvent( 'calypso_siterename_request', eventProperties ) );

	return fetchNonce( siteId )
		.then( nonce => {
			wpcom
				.undocumented()
				.changeSiteAddress( siteId, newBlogName, discard, nonce )
				.then( data => {
					const newSlug = get( data, 'new_slug' );

					if ( newSlug ) {
						dispatch( recordTracksEvent( 'calypso_siterename_success', eventProperties ) );

						const newAddress = newSlug + '.wordpress.com';
						dispatch( requestSite( siteId ) ).then( () => {
							page( domainManagementEdit( newAddress, newAddress ) );

							dispatch(
								// @TODO translate copy once finalised
								successNotice( 'Your new domain name is ready to go!', {
									id: 'siteRenameSuccessful',
									duration: 5000,
									showDismiss: true,
									isPersistent: true,
								} )
							);
						} );
					}

					dispatch( {
						type: SITE_RENAME_REQUEST_SUCCESS,
						newSlug,
						siteId,
					} );
				} )
				.catch( errorHandler );
		} )
		.catch( errorHandler );
};
