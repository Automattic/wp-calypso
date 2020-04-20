/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import FollowersList from './followers-list';
import ViewersList from './viewers-list';
import TeamList from 'my-sites/people/team-list';
import EmptyContent from 'components/empty-content';
import PeopleNotices from 'my-sites/people/people-notices';
import PeopleSectionNav from 'my-sites/people/people-section-nav';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import FormattedHeader from 'components/formatted-header';
import { getSelectedSiteId, getSelectedSite } from 'state/ui/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import canCurrentUser from 'state/selectors/can-current-user';
import isPrivateSite from 'state/selectors/is-private-site';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import titlecase from 'to-title-case';

class People extends React.Component {
	renderPeopleList() {
		const { site, search, filter, translate } = this.props;

		switch ( filter ) {
			case 'team':
				return <TeamList site={ site } search={ search } />;
			case 'followers':
				return <FollowersList site={ site } />;
			case 'email-followers':
				return <FollowersList site={ site } search={ search } type="email" />;
			case 'viewers':
				return <ViewersList site={ site } label={ translate( 'Viewers' ) } />;
			default:
				return null;
		}
	}

	render() {
		const {
			isJetpack,
			canViewPeople,
			siteId,
			site,
			search,
			filter,
			isPrivate,
			translate,
		} = this.props;

		if ( siteId && ! canViewPeople ) {
			return (
				<Main>
					<PageViewTracker
						path={ `/people/${ filter }/:site` }
						title={ `People > ${ titlecase( filter ) }` }
					/>
					<SidebarNavigation />
					<EmptyContent
						title={ translate( 'You are not authorized to view this page' ) }
						illustration={ '/calypso/images/illustrations/illustration-404.svg' }
					/>
				</Main>
			);
		}
		return (
			<Main>
				<PageViewTracker
					path={ `/people/${ filter }/:site` }
					title={ `People > ${ titlecase( filter ) }` }
				/>
				<SidebarNavigation />
				<FormattedHeader
					className="people__page-heading"
					headerText={ translate( 'People' ) }
					align="left"
				/>
				<div>
					{
						<PeopleSectionNav
							isJetpack={ isJetpack }
							isPrivate={ isPrivate }
							canViewPeople={ canViewPeople }
							search={ search }
							filter={ filter }
							site={ site }
						/>
					}
					<PeopleNotices />
					{ this.renderPeopleList() }
				</div>
			</Main>
		);
	}
}

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	return {
		siteId,
		site: getSelectedSite( state ),
		isJetpack: isJetpackSite( state, siteId ),
		isPrivate: isPrivateSite( state, siteId ),
		canViewPeople: canCurrentUser( state, siteId, 'list_users' ),
	};
} )( localize( People ) );
