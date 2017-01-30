/**
 * External Dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import SectionNav from 'components/section-nav';
import NavTabs from 'components/section-nav/tabs';
import NavItem from 'components/section-nav/item';
import FollowersCount from 'blocks/followers-count';
import { isEnabled } from 'config';

class StatsNavigation extends Component {
	static propTypes = {
		section: PropTypes.string.isRequired,
		site: PropTypes.oneOfType( [
			PropTypes.bool,
			PropTypes.object
		] )
	}

	render() {
		const { translate, section, site } = this.props;
		const siteFragment = site ? '/' + site.slug : '';
		const sectionTitles = {
			insights: translate( 'Insights' ),
			day: translate( 'Days' ),
			week: translate( 'Weeks' ),
			month: translate( 'Months' ),
			year: translate( 'Years' ),
			settings: translate( 'Settings' ),
		};

		return (
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
					{
						isEnabled( 'stats/settings' ) &&
						<NavItem path={ '/stats/settings' + siteFragment } selected={ section === 'settings' }>
							{ sectionTitles.settings }
						</NavItem>
					}
				</NavTabs>
				<FollowersCount />
			</SectionNav>
		);
	}
}

export default localize( StatsNavigation );
