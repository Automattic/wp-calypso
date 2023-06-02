import config from '@automattic/calypso-config';
import { createSelector } from '@automattic/state-utils';
import { compact } from 'lodash';
import { decodeEntities } from 'calypso/lib/formatting';
import { getDocumentHeadCappedUnreadCount } from 'calypso/state/document-head/selectors/get-document-head-capped-unread-count';
import { getDocumentHeadTitle } from 'calypso/state/document-head/selectors/get-document-head-title';
import getSiteTitle from 'calypso/state/sites/selectors/get-site-title';
import { getSelectedSiteId, isSiteSection } from 'calypso/state/ui/selectors';

import 'calypso/state/document-head/init';
import 'calypso/state/ui/init';

/**
 * Returns the formatted document title, based on the currently set title,
 * capped unreadCount, and selected site.
 *
 * @param  {Object}  state  Global state tree
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
