/**
 * External dependencies
 */
import React from 'react';
import omit from 'lodash/omit';
import debugModule from 'debug';

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

/**
 * Module variables
 */
const debug = debugModule( 'calypso:my-sites:people:main' );

export default React.createClass( {

	displayName: 'People',

	mixins: [ observe( 'sites', 'peopleLog' ) ],

	componentDidMount: function() {
		debug( 'PeopleList React component mounted.' );
	},

	renderPeopleList: function( site ) {
		switch ( this.props.filter ) {
			case 'team':
				return <TeamList site={ site } search={ this.props.search } role={ this.props.role } />;
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

	renderPeopleSectionNav: function( site ) {
		const commonProps = omit( this.props, [ 'sites' ] );
		if ( this.props.filter === 'team' ) {
			return <PeopleSectionNav { ...commonProps } site={ site } baseUrl={ `/people/team/${site}` } />;
		} else {
			return <PeopleSectionNav { ...commonProps } site={ site } />;
		}
	},

	render: function() {
		const site = this.props.sites.getSelectedSite();

		// Jetpack 3.7 is necessary to manage people
		if ( site && site.jetpack && site.versionCompare( '3.7.0-beta', '<' ) ) {
			return (
				<Main>
					<SidebarNavigation />
					<JetpackManageErrorPage
						template="updateJetpack"
						site={ site }
						version="3.7"
					/>
				</Main>
			);
		}
		if ( site && site.capabilities && ! site.capabilities.list_users ) {
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
					{ this.renderPeopleSectionNav( this.props.sites.selected ) }
					<PeopleNotices />
					{ this.renderPeopleList( site ) }
				</div>
			</Main>
		);
	}
} );
