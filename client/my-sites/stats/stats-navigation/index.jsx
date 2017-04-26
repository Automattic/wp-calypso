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
import QueryJetpackPlugins from 'components/data/query-jetpack-plugins';
import config from 'config';

const StatsNavigation = ( props ) => {
	const { translate, section, slug, siteId, isJetpack, isWooConnect } = props;
	const siteFragment = slug ? '/' + slug : '';
	const sectionTitles = {
		insights: translate( 'Insights' ),
		day: translate( 'Days' ),
		week: translate( 'Weeks' ),
		month: translate( 'Months' ),
		year: translate( 'Years' )
	};
	let statsControl;

	if ( config.isEnabled( 'woocommerce/extension-stats' ) ) {
		if ( isWooConnect ) {
			statsControl = (
				<SegmentedControl
					// eslint-disable-next-line wpcalypso/jsx-classname-namespace
					className="stats-navigation__control"
					initialSelected="site"
					options={ [
						{ value: 'site', label: translate( 'Site' ) },
						{ value: 'store', label: translate( 'Store' ), path: `/store/stats/${ slug }` },
					] }
				/>
			);
		}
	}

	return (
		<SectionNav selectedText={ sectionTitles[ section ] }>
			{ isJetpack && <QueryJetpackPlugins siteIds={ [ siteId ] } /> }
			<NavTabs label={ translate( 'Stats' ) }>
				<NavItem path={ '/stats/insights' + siteFragment } selected={ section === 'insights' }>
					{ sectionTitles.insights }
				</NavItem>
				<NavItem path={ '/stats/day' + siteFragment } selected={ section === 'day' }>
					{ sectionTitles.day }
				</NavItem>
				<NavItem path={ '/stats/week' + siteFragment } selected={ section === 'week' }>
					{ sectionTitles.week }
				</NavItem>
				<NavItem path={ '/stats/month' + siteFragment } selected={ section === 'month' }>
					{ sectionTitles.month }
				</NavItem>
				<NavItem path={ '/stats/year' + siteFragment } selected={ section === 'year' }>
					{ sectionTitles.year }
				</NavItem>
			</NavTabs>
			{ statsControl }
			<FollowersCount />
		</SectionNav>
	);
};

StatsNavigation.propTypes = {
	isJetpack: PropTypes.bool,
	isWooConnect: PropTypes.bool,
	section: PropTypes.string.isRequired,
	slug: PropTypes.string,
	siteId: PropTypes.number,
};

export default localize( StatsNavigation );
