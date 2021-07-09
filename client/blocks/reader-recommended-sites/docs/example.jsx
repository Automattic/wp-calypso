/**
 * External dependencies
 */

import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import ReaderRecommendedSites from '../';
import { Card } from '@automattic/components';

const sites = {
	longreads: { siteId: 70135762 },
	wordpress: { siteId: 3584907 },
};

export default class ReaderRecommendedSitesExample extends PureComponent {
	static displayName = 'ReaderRecommendedSitesExample';

	render() {
		return (
			<Card>
				<ReaderRecommendedSites sites={ [ sites.longreads, sites.wordpress ] } />
			</Card>
		);
	}
}
