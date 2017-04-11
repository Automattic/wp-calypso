/**
 * External dependencies
 */
import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import ConnectedReaderSubscriptionListItem from 'reader/following-manage/connected-subscription-list-item';
import Card from 'components/card';


const items = [
	{ feedId: 21587482 },
	{ feedId: 24393283 },
	{ feedId: 10056049 },
	{ siteId: 77147075 },
	{ feedId: 19850964 },
];

export default class ReaderSubscriptionListItemExample extends PureComponent {
	static displayName = 'ReaderSubscriptionListItem';

	render() {
		return (
			<Card>
				{ items.map( item =>
						<ConnectedReaderSubscriptionListItem
							key={ item.feedId || item.siteId }
							{ ...item }
						/>
				) }
			</Card>

		);
	}
};
