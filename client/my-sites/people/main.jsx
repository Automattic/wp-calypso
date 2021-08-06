import { localize } from 'i18n-calypso';
import React from 'react';
import { connect } from 'react-redux';
import titlecase from 'to-title-case';
import EmptyContent from 'calypso/components/empty-content';
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';
import ScreenOptionsTab from 'calypso/components/screen-options-tab';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import PeopleSectionNav from 'calypso/my-sites/people/people-section-nav';
import TeamList from 'calypso/my-sites/people/team-list';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import isPrivateSite from 'calypso/state/selectors/is-private-site';
import isSiteComingSoon from 'calypso/state/selectors/is-site-coming-soon';
import isSiteP2Hub from 'calypso/state/selectors/is-site-p2-hub';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSelectedSite } from 'calypso/state/ui/selectors';
import FollowersList from './followers-list';
import ViewersList from './viewers-list';

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

	renderSubheaderText() {
		const { translate, filter } = this.props;

		switch ( filter ) {
			case 'followers':
				return translate(
					'People who have subscribed to your site using their WordPress.com account.'
				);
			case 'email-followers':
				return translate( 'People who have subscribed to your site using their email address.' );
			default:
				return translate( 'Invite contributors to your site and manage their access settings.' );
		}
	}

	renderHeaderText() {
		const { site, isWPForTeamsSite, isP2HubSite, translate } = this.props;

		if ( isWPForTeamsSite ) {
			if ( isP2HubSite ) {
				return translate( 'People in %(sitename)s', {
					args: {
						sitename: site.name,
						context: 'People page for P2 hubs.',
					},
				} );
			}
			return translate( 'People in this space' );
		}

		return translate( 'People' );
	}

	render() {
		const {
			isComingSoon,
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
				<ScreenOptionsTab wpAdminPath="users.php" />
				<PageViewTracker
					path={ `/people/${ filter }/:site` }
					title={ `People > ${ titlecase( filter ) }` }
				/>
				<SidebarNavigation />
				<FormattedHeader
					brandFont
					className="people__page-heading"
					headerText={ this.renderHeaderText() }
					subHeaderText={ this.renderSubheaderText() }
					align="left"
					hasScreenOptions
				/>
				<div>
					{
						<PeopleSectionNav
							isJetpack={ isJetpack }
							isPrivate={ isPrivate }
							isComingSoon={ isComingSoon }
							canViewPeople={ canViewPeople }
							search={ search }
							filter={ filter }
							site={ site }
						/>
					}
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
		isComingSoon: isSiteComingSoon( state, siteId ),
		isWPForTeamsSite: isSiteWPForTeams( state, siteId ),
		isP2HubSite: isSiteP2Hub( state, siteId ),
	};
} )( localize( People ) );
