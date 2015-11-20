/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var PostsNavigation = require( './posts-navigation' ),
	observe = require( 'lib/mixins/data-observe' ),
	SidebarNavigation = require( 'my-sites/sidebar-navigation' ),
	PostList = require( './post-list' ),
	config = require( 'config' ),
	Main = require( 'components/main' ),
	notices = require( 'notices' );

module.exports = React.createClass( {

	displayName: 'Posts',

	mixins: [ observe( 'sites' ) ],

	componentWillMount: function() {
		var selectedSite = this.props.sites.getSelectedSite();
		this._setWarning( selectedSite );
	},

	componentWillReceiveProps: function( nextProps ) {
		var selectedSite = nextProps.sites.getSelectedSite();
		this._setWarning( selectedSite );
	},

	render: function() {
		return (
			<Main className="posts">
				<SidebarNavigation />
				<PostsNavigation { ...this.props } />
				<PostList { ...this.props } />
			</Main>
		);
	},

	_setWarning: function( selectedSite ) {
		if ( selectedSite && selectedSite.jetpack && ! selectedSite.hasMinimumJetpackVersion ) {
			notices.warning(
				this.translate( 'Jetpack %(version)s is required to take full advantage of all post editing features.', { args: { version: config( 'jetpack_min_version' ) } } ),
				{ button: this.translate( 'Update now' ), href: selectedSite.options.admin_url + 'plugins.php?plugin_status=upgrade' }
			);
		}
	}

} );
