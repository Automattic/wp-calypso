/**
 * External dependencies
 */
import React from 'react';
import debugModule from 'debug';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import FollowersList from './followers-list';
import ViewersList from './viewers-list';
import TeamList from 'my-sites/people/team-list';
import EmptyContent from 'components/empty-content';
import observe from 'lib/mixins/data-observe';
import PeopleNotices from 'my-sites/people/people-notices';
import JetpackManageErrorPage from 'my-sites/jetpack-manage-error-page';
import PeopleSectionNav from 'my-sites/people/people-section-nav';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import { getSelectedSiteId, getSelectedSite } from 'state/ui/selectors';
import {
	isJetpackMinimumVersion,
	isJetpackSite,
} from 'state/sites/selectors';
import { canCurrentUser, isPrivateSite } from 'state/selectors';

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
				return <FollowersList site={ site } label={ this.translate( 'Followers' ) } />;
			case 'email-followers':
				return <FollowersList
					site={ site }
					search={ this.props.search }
					label={ this.translate( 'Email Followers' ) }
					type="email" />;
			case 'viewers':
				return <ViewersList site={ site } label={ this.translate( 'Viewers' ) } />;
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
						title={ this.translate( 'You are not authorized to view this page' ) }
						illustration={ '/calypso/images/drake/drake-empty-results.svg' }
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
)( People );
