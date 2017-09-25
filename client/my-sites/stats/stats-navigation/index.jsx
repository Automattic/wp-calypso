/** @format */
/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { includes } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import FollowersCount from 'blocks/followers-count';
import QueryJetpackPlugins from 'components/data/query-jetpack-plugins';
import SectionNav from 'components/section-nav';
import NavItem from 'components/section-nav/item';
import NavTabs from 'components/section-nav/tabs';
import SegmentedControl from 'components/segmented-control';
import config from 'config';
import { isPluginActive, isSiteOnPaidPlan } from 'state/selectors';
import { isJetpackSite } from 'state/sites/selectors';

const StatsNavigation = props => {
	const { translate, section, slug, siteId, isJetpack, isStore, hasPaidPlan } = props;
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
				primary
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
		config.isEnabled( 'jetpack/activity-log' ) && isJetpack && hasPaidPlan ? (
			<NavItem path={ '/stats/activity' + siteFragment } selected={ section === 'activity' }>
				{ sectionTitles.activity }
			</NavItem>
		) : null;

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
		hasPaidPlan: isSiteOnPaidPlan( state, siteId ),
		isJetpack,
		isStore: isJetpack && isPluginActive( state, siteId, 'woocommerce' ),
		siteId,
	};
} )( localized );
