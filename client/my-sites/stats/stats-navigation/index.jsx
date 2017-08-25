/** @format */
/**
 * External Dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import SectionNav from 'components/section-nav';
import NavTabs from 'components/section-nav/tabs';
import NavItem from 'components/section-nav/item';
import FollowersCount from 'blocks/followers-count';
import SegmentedControl from 'components/segmented-control';
import QueryJetpackPlugins from 'components/data/query-jetpack-plugins';
import { isPluginActive } from 'state/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import config from 'config';

const StatsNavigation = props => {
	const { translate, section, slug, siteId, isJetpack, isStore } = props;
	const siteFragment = slug ? '/' + slug : '';
	const sectionTitles = {
		insights: translate( 'Insights' ),
		day: translate( 'Days' ),
		week: translate( 'Weeks' ),
		month: translate( 'Months' ),
		year: translate( 'Years' ),
		activity: translate( 'Activity' ),
	};

	let statsControl;

	if ( isStore ) {
		const validSection = includes( [ 'day', 'week', 'month', 'year' ], section ) ? section : 'day';
		statsControl = (
			<SegmentedControl
				className="stats-navigation__control is-store"
				initialSelected="site"
				options={ [
					{
						value: 'site',
						label: translate( 'Site' ),
					},
					{
						value: 'store',
						label: translate( 'Store' ),
						path: `/store/stats/orders/${ validSection }/${ slug }`,
					},
				] }
			/>
		);
	}

	const ActivityTab =
		config.isEnabled( 'jetpack/activity-log' ) && isJetpack
			? <NavItem path={ '/stats/activity' + siteFragment } selected={ section === 'activity' }>
					{ sectionTitles.activity }
				</NavItem>
			: null;

	return (
		<SectionNav selectedText={ sectionTitles[ section ] }>
			{ isJetpack && siteId && <QueryJetpackPlugins siteIds={ [ siteId ] } /> }
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
				{ ActivityTab }
			</NavTabs>
			{ statsControl }
			<FollowersCount />
		</SectionNav>
	);
};

StatsNavigation.propTypes = {
	isJetpack: PropTypes.bool,
	isStore: PropTypes.bool,
	section: PropTypes.string.isRequired,
	slug: PropTypes.string,
	siteId: PropTypes.number,
};

const localized = localize( StatsNavigation );

export default connect( ( state, { siteId } ) => {
	const isJetpack = isJetpackSite( state, siteId );
	return {
		isJetpack,
		isStore: isJetpack && isPluginActive( state, siteId, 'woocommerce' ),
		siteId,
	};
} )( localized );
