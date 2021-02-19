/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Main from 'calypso/components/main';
import FollowersList from './followers-list';
import ViewersList from './viewers-list';
import TeamList from 'calypso/my-sites/people/team-list';
import EmptyContent from 'calypso/components/empty-content';
import PeopleNotices from 'calypso/my-sites/people/people-notices';
import PeopleSectionNav from 'calypso/my-sites/people/people-section-nav';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import FormattedHeader from 'calypso/components/formatted-header';
import { getSelectedSiteId, getSelectedSite } from 'calypso/state/ui/selectors';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import canCurrentUser from 'calypso/state/selectors/can-current-user';
import isPrivateSite from 'calypso/state/selectors/is-private-site';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import titlecase from 'to-title-case';
import isSiteComingSoon from 'calypso/state/selectors/is-site-coming-soon';

class People extends React.Component {
	renderPeopleList() {
		const { site, search, filter, translate } = this.props;

		switch ( filter ) {
			case 'team':
				return <TeamList site={ site } search={ search } />;
			case 'followers':
				/* We're using the `key` prop here to make sure a fresh instance
				   is mounted in case a user changes their site. That way we don't
				   have to deal with resetting internal state. Same goes for email
				   followers. */
				return <FollowersList key={ `people-followers-${ site.ID }` } site={ site } />;
			case 'email-followers':
				return (
					<FollowersList
						key={ `people-email-followers-${ site.ID }` }
						site={ site }
						search={ search }
						type="email"
					/>
				);
			case 'viewers':
				return (
					<ViewersList
						key={ `people-viewers-${ site.ID }` }
						site={ site }
						label={ translate( 'Viewers' ) }
					/>
				);
			default:
				return null;
		}
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
				<PageViewTracker
					path={ `/people/${ filter }/:site` }
					title={ `People > ${ titlecase( filter ) }` }
				/>
				<SidebarNavigation />
				<FormattedHeader
					brandFont
					className="people__page-heading"
					headerText={ translate( 'People' ) }
					align="left"
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
		isComingSoon: isSiteComingSoon( state, siteId ),
	};
} )( localize( People ) );
