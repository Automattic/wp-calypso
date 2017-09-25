/**
 * External dependencies
 */
import debugModule from 'debug';
import { localize } from 'i18n-calypso';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import FollowersList from './followers-list';
import ViewersList from './viewers-list';
import EmptyContent from 'components/empty-content';
import Main from 'components/main';
import observe from 'lib/mixins/data-observe';
import JetpackManageErrorPage from 'my-sites/jetpack-manage-error-page';
import PeopleNotices from 'my-sites/people/people-notices';
import PeopleSectionNav from 'my-sites/people/people-section-nav';
import TeamList from 'my-sites/people/team-list';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import { canCurrentUser, isPrivateSite } from 'state/selectors';
import { isJetpackMinimumVersion, isJetpackSite } from 'state/sites/selectors';
import { getSelectedSiteId, getSelectedSite } from 'state/ui/selectors';

/**
 * Module variables
 */
const debug = debugModule( 'calypso:my-sites:people:main' );

// TODO: port to es6 once we remove the last observe
export const People = React.createClass( { // eslint-disable-line react/prefer-es6-class

	displayName: 'People',

	mixins: [ observe( 'peopleLog' ) ],

	componentDidMount: function() {
		debug( 'PeopleList React component mounted.' );
	},

	renderPeopleList: function( site ) {
		switch ( this.props.filter ) {
			case 'team':
				return <TeamList site={ site } search={ this.props.search } />;
			case 'followers':
				return <FollowersList site={ site } label={ this.props.translate( 'Followers' ) } />;
			case 'email-followers':
				return (
				    <FollowersList
						site={ site }
						search={ this.props.search }
						label={ this.props.translate( 'Email Followers' ) }
						type="email" />
				);
			case 'viewers':
				return <ViewersList site={ site } label={ this.props.translate( 'Viewers' ) } />;
			default:
				return null;
		}
	},

	render: function() {
		const {
			isJetpack,
			jetpackPeopleSupported,
			canViewPeople,
			siteId,
			site,
			search,
			filter,
			isPrivate
		} = this.props;

		// Jetpack 3.7 is necessary to manage people
		if ( isJetpack && ! jetpackPeopleSupported ) {
			return (
				<Main>
					<SidebarNavigation />
					<JetpackManageErrorPage
						template="updateJetpack"
						siteId={ siteId }
						version="3.7"
					/>
				</Main>
			);
		}
		if ( siteId && ! canViewPeople ) {
			return (
			    <Main>
					<SidebarNavigation />
					<EmptyContent
						title={ this.props.translate( 'You are not authorized to view this page' ) }
						illustration={ '/calypso/images/illustrations/illustration-404.svg' }
					/>
				</Main>
			);
		}
		return (
			<Main>
				<SidebarNavigation />
				<div>
					{ <PeopleSectionNav
						isJetpack={ isJetpack }
						isPrivate={ isPrivate }
						jetpackPeopleSupported={ jetpackPeopleSupported }
						canViewPeople={ canViewPeople }
						search={ search }
						filter={ filter }
						site={ site } /> }
					<PeopleNotices />
					{ this.renderPeopleList( site ) }
				</div>
			</Main>
		);
	}
} );

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		return {
			siteId,
			site: getSelectedSite( state ),
			isJetpack: isJetpackSite( state, siteId ),
			isPrivate: isPrivateSite( state, siteId ),
			canViewPeople: canCurrentUser( state, siteId, 'list_users' ),
			jetpackPeopleSupported: isJetpackMinimumVersion( state, siteId, '3.7.0-beta' ),
		};
	}
)( localize( People ) );
