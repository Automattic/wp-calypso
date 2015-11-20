/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal Dependencies
 */
var SidebarNavigation = require( 'components/sidebar-navigation' ),
	user = require( 'lib/user' )(),
	Gravatar = require( 'components/gravatar' ),
	TitleData = require( 'components/data/screen-title' );

module.exports = React.createClass( {
	displayName: 'MeSidebarNavigation',

	render: function() {
		return (
			<TitleData>
				<SidebarNavigation
					sectionName="me"
					sectionTitle={ this.translate( 'Me' ) }>
					<Gravatar user={ user.get() } size={ 30 } imgSize={ 400 } />
				</SidebarNavigation>
			</TitleData>
		);
	}
} );
