import { localize } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import titlecase from 'to-title-case';
import EmptyContent from 'calypso/components/empty-content';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import P2TeamBanner from 'calypso/my-sites/people/p2-team-banner';
import PeopleSectionNav from 'calypso/my-sites/people/people-section-nav';
import TeamList from 'calypso/my-sites/people/team-list';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import isEligibleForSubscriberImporter from 'calypso/state/selectors/is-eligible-for-subscriber-importer';
import isPrivateSite from 'calypso/state/selectors/is-private-site';
import isSiteComingSoon from 'calypso/state/selectors/is-site-coming-soon';
import isSiteP2Hub from 'calypso/state/selectors/is-site-p2-hub';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSelectedSite } from 'calypso/state/ui/selectors';
import FollowersList from './followers-list';
import ViewersList from './viewers-list';

class People extends Component {
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
		const { isWPForTeamsSite, translate, filter } = this.props;

		if ( isWPForTeamsSite ) {
			return this.getSubheaderTextForP2();
		}

		switch ( filter ) {
			case 'followers':
				return translate(
					'People who have subscribed to your site using their WordPress.com account. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
					{
						components: {
							learnMoreLink: (
								<InlineSupportLink
									key="learnMoreFollowers"
									supportContext="followers"
									showIcon={ false }
								/>
							),
						},
					}
				);
			case 'email-followers':
				return translate(
					'People who have subscribed to your site using their email address. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
					{
						components: {
							learnMoreLink: (
								<InlineSupportLink
									key="learnMoreFollowers"
									supportContext="followers"
									showIcon={ false }
								/>
							),
						},
					}
				);
			default:
				return isWPForTeamsSite
					? this.getSubheaderTextForP2()
					: translate(
							'Invite contributors to your site and manage their access settings. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
							{
								components: {
									learnMoreLink: (
										<InlineSupportLink
											key="learnMoreTeam"
											supportContext="team"
											showIcon={ false }
										/>
									),
								},
							}
					  );
		}
	}

	getSubheaderTextForP2() {
		const { isP2HubSite, translate } = this.props;
		const translateArgs = {
			components: {
				learnMoreLink: <InlineSupportLink supportContext="team" showIcon={ false } />,
			},
		};
		if ( isP2HubSite ) {
			return translate(
				'Invite members to your workspace and manage their access settings.',
				translateArgs
			);
		}
		return translate(
			'Invite members and guests to this P2 and manage their access settings.',
			translateArgs
		);
	}

	renderHeaderText() {
		const { site, isWPForTeamsSite, isP2HubSite, translate } = this.props;

		if ( isWPForTeamsSite ) {
			if ( isP2HubSite ) {
				return translate( 'Users in %(sitename)s', {
					args: {
						sitename: site.name,
						context: 'Users page for P2 hubs.',
					},
				} );
			}
			return translate( 'Users in this P2' );
		}

		return translate( 'Users' );
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
			isWPForTeamsSite,
			includeSubscriberImporter,
		} = this.props;

		if ( siteId && ! canViewPeople ) {
			return (
				<Main>
					<PageViewTracker
						path={ `/people/${ filter }/:site` }
						title={ `People > ${ titlecase( filter ) }` }
					/>
					<EmptyContent title={ translate( 'You are not authorized to view this page' ) } />
				</Main>
			);
		}

		return (
			<Main>
				<PageViewTracker
					path={ `/people/${ filter }/:site` }
					title={ `People > ${ titlecase( filter ) }` }
				/>
				<NavigationHeader
					screenOptionsTab="users.php"
					navigationItems={ [] }
					title={ this.renderHeaderText() }
					subtitle={ this.renderSubheaderText() }
				/>
				<div>
					<PeopleSectionNav
						isJetpack={ isJetpack }
						isPrivate={ isPrivate }
						isComingSoon={ isComingSoon }
						canViewPeople={ canViewPeople }
						search={ search }
						filter={ filter }
						site={ site }
						includeSubscriberImporter={ includeSubscriberImporter }
					/>
					{ isWPForTeamsSite && <P2TeamBanner context={ filter } site={ site } /> }
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
		includeSubscriberImporter: isEligibleForSubscriberImporter( state ),
	};
} )( localize( People ) );
