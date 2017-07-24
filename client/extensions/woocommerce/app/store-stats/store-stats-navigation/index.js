/**
 * External Dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import SectionNav from 'components/section-nav';
import StoreStatsNavigationTabs from './navtabs';
import FollowersCount from 'blocks/followers-count';
import SegmentedControl from 'components/segmented-control';
import { UNITS } from 'woocommerce/app/store-stats/constants';

const StoreStatsNavigation = props => {
	const { translate, slug, type, unit } = props;
	return (
		<div className="store-stats-navigation">
			<SectionNav selectedText={ UNITS[ unit ].title }>
				<StoreStatsNavigationTabs
					label={ 'Stats' }
					slug={ slug }
					type={ type }
					unit={ unit }
					units={ UNITS }
				/>
				<SegmentedControl
					initialSelected="store"
					options={ [
						{ value: 'site', label: translate( 'Site' ), path: `/stats/${ unit }/${ slug }` },
						{ value: 'store', label: translate( 'Store' ) },
					] }
				/>
				<FollowersCount />
			</SectionNav>
		</div>
	);
};

StoreStatsNavigation.propTypes = {
	slug: PropTypes.string
};

export default localize( StoreStatsNavigation );
