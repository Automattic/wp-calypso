/**
 * External dependencies
 */
import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import ReaderSubscriptionListItem from '../';
import Card from 'components/card';
import { getCurrentUser } from 'state/current-user/selectors';
import feedSiteFluxAdapter from 'lib/reader-post-flux-adapter';
import { localize } from 'i18n-calypso';


const items = [
	{ feedId: 21587482 },
	{ feedId: 24393283 },
	{ feedId: 10056049 },
	{ siteId: 77147075 },
	{ feedId: 19850964 },
];

const ConnectedListItem = localize( feedSiteFluxAdapter(
	( { feed, site, translate, url, feedId, siteId } ) => (
		<ReaderSubscriptionListItem
			siteUrl={ url }
			siteTitle={ feed && feed.name }
			siteAuthor={ site && site.owner }
			siteExcerpt={ feed && feed.description }
			translate={ translate }
			feedId={ feedId }
			siteId={ siteId }
			site={ site }
			feed={ feed }
		/>
	)
) );

export default class ReaderSubscriptionListItemExample extends PureComponent {
	static displayName = 'ReaderSubscriptionListItem';

	render() {
		return (
			<Card>
				{ items.map( item =>
						<ConnectedListItem
							key={ item.feedId || item.siteId }
							{ ...item }
						/>
				) }
			</Card>

		);
	}
};
