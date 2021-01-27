/**
 * External dependencies
 */
import { compact } from 'lodash';

/**
 * Internal dependencies
 */
import config from '@automattic/calypso-config';
import createSelector from 'calypso/lib/create-selector';
import { decodeEntities } from 'calypso/lib/formatting';
import { getSelectedSiteId, isSiteSection } from 'calypso/state/ui/selectors';
import getSiteTitle from 'calypso/state/sites/selectors/get-site-title';
import { getDocumentHeadTitle } from 'calypso/state/document-head/selectors/get-document-head-title';
import { getDocumentHeadCappedUnreadCount } from 'calypso/state/document-head/selectors/get-document-head-capped-unread-count';

/**
 * Internal dependencies
 */
import 'calypso/state/ui/init';

/**
 * Returns the formatted document title, based on the currently set title,
 * capped unreadCount, and selected site.
 *
 * @param  {object}  state  Global state tree
 * @returns {string}         Formatted title
 */
export const getDocumentHeadFormattedTitle = createSelector(
	( state ) => {
		let title = '';

		const unreadCount = getDocumentHeadCappedUnreadCount( state );
		if ( unreadCount ) {
			title += `(${ unreadCount }) `;
		}

		title += compact( [
			getDocumentHeadTitle( state ),
			isSiteSection( state ) && getSiteTitle( state, getSelectedSiteId( state ) ),
		] ).join( ' ‹ ' );

		if ( title ) {
			title = decodeEntities( title ) + ' — ';
		}

		return title + config( 'site_name' );
	},
	( state ) => [ state.documentHead, state.ui.section, state.ui.selectedSiteId ]
);
