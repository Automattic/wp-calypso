/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import { map } from 'lodash';

/**
 * Internal dependencies
 */
import ReaderRecommendedSites from '../';
import Card from 'components/card';


const sites = {
	'longreads': { siteId: 70135762 },
	'wordpress': { siteId: 25823 },
}

export default class ReaderRecommendedSitesExample extends PureComponent {
	static displayName = 'ReaderRecommendedSitesExample';

	render() {
		return (
			<Card>
				<ReaderRecommendedSites
					sites={ [ sites.longreads, sites.wordpress ] }
				/>
			</Card>
		);
	}
};
