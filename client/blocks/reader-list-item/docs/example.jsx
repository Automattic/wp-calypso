/**
 * External dependencies
 */

import React, { PureComponent } from 'react';
import { map } from 'lodash';

/**
 * Internal dependencies
 */
import ConnectedReaderListItem from 'blocks/reader-list-item/connected';
import ReaderListItemPlaceholder from 'blocks/reader-list-item/placeholder';
import { Card } from '@automattic/components';

const sites = {
	longreads: { siteId: 70135762 },
	wordpress: { feedId: 25823 },
	bestBlogInTheWorldAAA: { siteId: 77147075 },
	mathWithBadDrawings: { feedId: 10056049 },
	uproxx: { feedId: 19850964 },
	atlantic: { feedId: 49548095 },
	fourthGenerationFarmGirl: { feedId: 24393283 },
};

export default class ReaderListItemExample extends PureComponent {
	static displayName = 'ReaderListItem';

	render() {
		return (
			<Card>
				{ map( sites, ( site ) => (
					<ConnectedReaderListItem key={ site.feedId || site.siteId } { ...site } />
				) ) }
				<ReaderListItemPlaceholder />
			</Card>
		);
	}
}
