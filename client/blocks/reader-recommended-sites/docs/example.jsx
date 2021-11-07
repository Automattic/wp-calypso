import { Card } from '@automattic/components';
import { PureComponent } from 'react';
import ReaderRecommendedSites from '../';

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
