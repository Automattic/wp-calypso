/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import StoreStatsNavigationTabs from './navtabs';
import FollowersCount from 'blocks/followers-count';
import SectionNav from 'components/section-nav';
import SegmentedControl from 'components/segmented-control';
import { UNITS } from 'woocommerce/app/store-stats/constants';

const StoreStatsNavigation = props => {
	const { translate, slug, type, unit } = props;
	const selectedText = UNITS[ unit ].title;
	return (
		<div className="store-stats-navigation">
			<SectionNav selectedText={ selectedText }>
				<StoreStatsNavigationTabs
					label={ 'Stats' }
					slug={ slug }
					type={ type }
					unit={ unit }
					units={ UNITS }
					selectedText={ selectedText }
				/>
				<SegmentedControl
					initialSelected="store"
					options={ [
						{ value: 'site', label: translate( 'Site' ), path: `/stats/${ unit }/${ slug }` },
						{ value: 'store', label: translate( 'Store' ) },
					] }
					primary
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
