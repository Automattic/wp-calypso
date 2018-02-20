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
	SITE_RENAME_REQUEST,
	SITE_RENAME_REQUEST_FAILURE,
	SITE_RENAME_REQUEST_SUCCESS,
} from 'state/action-types';
import { errorNotice, successNotice } from 'state/notices/actions';
import { domainManagementEdit } from 'my-sites/domains/paths';
import { requestSite } from 'state/sites/actions';
import debugFactory from 'debug';

const debug = debugFactory( 'calypso:site-rename' );

export const requestPreflight = ( blogName, siteId ) => dispatch => {
	dispatch( { type: 'SITE_RENAME_PREFLIGHT' } ); // @TODO proper redux
	wpcom
		.undocumented()
		.getRequestSiteRenamePreflight( blogName, siteId )
		.then( data => {
			debug( 'preflight', { data } );
			// @TODO dispatch...
		} )
		.catch( error => {
			debug( 'preflight', { error } );
			// @TODO dispatch...
		} );
};

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
			error.message || "Sorry, we we're unable to complete your domain change. Please try again."
		)
	);

export const requestSiteRename = ( siteId, newBlogName, discard, nonce ) => dispatch => {
	dispatch( {
		type: SITE_RENAME_REQUEST,
		siteId,
	} );

	wpcom
		.undocumented()
		.updateSiteName( siteId, newBlogName, discard, nonce )
		.then( data => {
			const newSlug = get( data, 'new_slug' );

			if ( newSlug ) {
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
		.catch( error => {
			dispatchErrorNotice( dispatch, error );
			dispatch( {
				type: SITE_RENAME_REQUEST_FAILURE,
				error: error.message,
				siteId,
			} );
		} );
};
