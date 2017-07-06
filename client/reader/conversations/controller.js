/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import route from 'lib/route';
import { recordTrack } from 'reader/stats';
import { renderWithReduxStore } from 'lib/react-helpers';
import AsyncLoad from 'components/async-load';
import { trackPageLoad } from 'reader/controller-helper';

const ANALYTICS_PAGE_TITLE = 'Reader';

export function conversations( context ) {
	const basePath = route.sectionify( context.path );
	const fullAnalyticsPageTitle = ANALYTICS_PAGE_TITLE + ' > Conversations';

	const mcKey = 'conversations';

	trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );
	recordTrack( 'calypso_reader_discover_viewed' );

	renderWithReduxStore(
		<AsyncLoad
			require="reader/conversations/stream"
			key={ 'conversations' }
			title="Conversations"
		/>,
		document.getElementById( 'primary' ),
		context.store,
	);
}
