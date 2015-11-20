/**
 * External dependencies
 */
var React = require( 'react/addons' ),
	omit = require( 'lodash/object/omit' ),
	debug = require( 'debug' )( 'calypso:my-sites:people:main' );

/**
 * Internal dependencies
 */
var Main = require( 'components/main' ),
	FollowersList = require( './followers-list' ),
	ViewersList = require( './viewers-list' ),
	TeamList = require( 'my-sites/people/team-list' ),
	EmptyContent = require( 'components/empty-content' ),
	observe = require( 'lib/mixins/data-observe' ),
	PeopleNotices = require( 'my-sites/people/people-notices' ),
	JetpackManageErrorPage = require( 'my-sites/jetpack-manage-error-page' ),
	PeopleSectionNav = require( 'my-sites/people/people-section-nav' ),
	SidebarNavigation = require( 'my-sites/sidebar-navigation' );

module.exports = React.createClass( {

	displayName: 'People',

	mixins: [ observe( 'sites', 'peopleLog' ) ],

	componentDidMount: function() {
		debug( 'PeopleList React component mounted.' );
	},

	renderPeopleList: function( site ) {
		switch ( this.props.filter ) {
			case 'team':
				return <TeamList site={ site } search={ this.props.search } />;
				break;
			case 'followers':
				return <FollowersList site={ site } label={ this.translate( 'Followers' ) } />;
				break;
			case 'email-followers':
				return <FollowersList site={ site } search={ this.props.search } label={ this.translate( 'Email Followers' ) } type="email" />;
				break;
			case 'viewers':
				return <ViewersList site={ site } label={ this.translate( 'Viewers' ) } />;
			default:
				return null;
		}
	},

	render: function() {
		var site = this.props.sites.getSelectedSite();

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
					{ <PeopleSectionNav { ...omit( this.props, [ 'sites' ] ) } site={ site } /> }
					<PeopleNotices siteId={ site && site.ID } />
					{ this.renderPeopleList( site ) }
				</div>
			</Main>
		);
	}
} );
