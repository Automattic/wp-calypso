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
import siteStatsStickyTabActions from 'lib/site-stats-sticky-tab/actions';
import FollowersCount from 'blocks/followers-count';

class StatsNavigation extends Component {
	static propTypes = {
		section: PropTypes.string.isRequired,
		site: PropTypes.oneOfType( [
			PropTypes.bool,
			PropTypes.object
		] )
	}

	componentDidMount() {
		const slug = this.props.site ? this.props.site.slug : '';
		siteStatsStickyTabActions.saveFilterAndSlug( this.props.section, slug );
	}

	componentDidUpdate() {
		const slug = this.props.site ? this.props.site.slug : '';
		siteStatsStickyTabActions.saveFilterAndSlug( this.props.section, slug );
	}

	render() {
		const { translate, section, site } = this.props;
		const siteFragment = site ? '/' + site.slug : '';
		const sectionTitles = {
			insights: translate( 'Insights' ),
			day: translate( 'Days' ),
			week: translate( 'Weeks' ),
			month: translate( 'Months' ),
			year: translate( 'Years' )
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
				</NavTabs>
				<FollowersCount />
			</SectionNav>
		);
	}
}

export default localize( StatsNavigation );
