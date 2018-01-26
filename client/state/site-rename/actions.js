/** @format */
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
	SITE_RENAME_REQUEST,
	SITE_RENAME_REQUEST_FAILURE,
	SITE_RENAME_REQUEST_SUCCESS,
} from 'state/action-types';
import { successNotice } from 'state/notices/actions';
import { domainManagementEdit } from 'my-sites/domains/paths';

export const requestSiteRename = ( siteId, newBlogName, discard ) => dispatch => {
	dispatch( {
		type: SITE_RENAME_REQUEST,
		siteId,
	} );

	return wpcom
		.undocumented()
		.updateSiteName( siteId, newBlogName, discard )
		.then( data => {
			const newSlug = get( data, 'new_slug' );

			if ( newSlug ) {
				const newAddress = newSlug + '.wordpress.com';
				page( domainManagementEdit( newAddress, newAddress ) );
				dispatch(
					successNotice( translate( 'Your new site name is ready to go!' ), {
						id: 'siteRenameSuccessful',
						duration: 5000,
						showDismiss: true,
						isPersistent: true,
					} )
				);
			}

			dispatch( {
				type: SITE_RENAME_REQUEST_SUCCESS,
				newSlug,
				siteId,
			} );
		} )
		.catch( error => {
			dispatch( {
				type: SITE_RENAME_REQUEST_FAILURE,
				error: error.message,
				siteId,
			} );
		} );
};
