/**
 * External Dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import SectionNav from 'components/section-nav';
import NavTabs from 'components/section-nav/tabs';
import NavItem from 'components/section-nav/item';
import FollowersCount from 'blocks/followers-count';
import SegmentedControl from 'components/segmented-control';

const StoreStatsNavigation = props => {
	const { translate, slug, type, unit } = props;
	const units = {
		day: translate( 'Days' ),
		week: translate( 'Weeks' ),
		month: translate( 'Months' ),
		year: translate( 'Years' ),
	};
	return (
		<SectionNav selectedText={ units[ unit ] }>
			<NavTabs label={ translate( 'Stats' ) }>
				{ Object.keys( units ).map( key => (
					<NavItem
						key={ key }
						path={ `/store/stats/${ type }/${ key }/${ slug }` }
						selected={ unit === key }
					>
						{ units[ key ] }
					</NavItem>
				) ) }
			</NavTabs>
			<SegmentedControl
				initialSelected="store"
				options={ [
					{ value: 'site', label: translate( 'Site' ), path: `/stats/${ unit }/${ slug }` },
					{ value: 'store', label: translate( 'Store' ) },
				] }
			/>
			<FollowersCount />
		</SectionNav>
	);
};

StoreStatsNavigation.propTypes = {
	slug: PropTypes.string
};

export default localize( StoreStatsNavigation );
