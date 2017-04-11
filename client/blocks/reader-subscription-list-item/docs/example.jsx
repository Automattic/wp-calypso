/**
 * External dependencies
 */
import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import ConnectedReaderSubscriptionListItem from 'reader/following-manage/connected-subscription-list-item';
import Card from 'components/card';


const longreads = { siteId: 70135762 };
const wordpress = { feedId: 25823 };
const bestBlogInTheWorldAAA = { siteId: 77147075 };
const mathWithBadDrawings = { feedId: 10056049 };
const uproxx = { feedId: 19850964 };
const atlantic = { feedId: 49548095 };
const fourthGenerationFarmGirl = { feedId: 24393283 };


const items = [
	longreads,
	wordpress,
	bestBlogInTheWorldAAA,
	fourthGenerationFarmGirl,
	atlantic,
	mathWithBadDrawings,
	uproxx,
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
