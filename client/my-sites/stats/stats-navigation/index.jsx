/**
 * External Dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { flowRight } from 'lodash';

/**
 * Internal dependencies
 */
import SectionNav from 'components/section-nav';
import NavTabs from 'components/section-nav/tabs';
import NavItem from 'components/section-nav/item';
import FollowersCount from 'blocks/followers-count';
import { getSelectedSiteSlug } from 'state/ui/selectors';
import Banner from 'components/banner';
import { PLAN_PERSONAL } from 'lib/plans/constants';

const StatsNavigation = ( props ) => {
	const { translate, section, slug } = props;
	const siteFragment = slug ? '/' + slug : '';
	const sectionTitles = {
		insights: translate( 'Insights' ),
		day: translate( 'Days' ),
		week: translate( 'Weeks' ),
		month: translate( 'Months' ),
		year: translate( 'Years' )
	};

	return (
		<div>
			<Banner
				event="free-to-paid-stats-nudge"
				plan={ PLAN_PERSONAL }
				title="Upgrade to attract more traffic"
			/>
			<SectionNav selectedText={ sectionTitles[ section ] }>
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
				<FollowersCount />
			</SectionNav>
		</div>
	);
};

StatsNavigation.propTypes = {
	section: PropTypes.string.isRequired,
	slug: PropTypes.string,
};

const connectComponent = connect(
	state => {
		return {
			slug: getSelectedSiteSlug( state )
		};
	}
);

export default flowRight(
	connectComponent,
	localize
)( StatsNavigation );
