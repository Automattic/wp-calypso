/**
 * External dependencies
 */
var React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:my-sites:drafts' ),
	classNames = require( 'classnames' );

/**
 * Internal dependencies
 */
var DraftList = require( './draft-list' ),
	SidebarNavigation = require( 'my-sites/sidebar-navigation' );


export default React.createClass( {

	displayName: 'Drafts',

	propTypes: {
		trackScrollPage: React.PropTypes.func.isRequired
	},

	componentDidMount: function() {
		debug( 'Drafts React component mounted.' );
	},

	render: function() {
		var containerClass;

		containerClass = classNames( {
			'main': true,
			'drafts': true,
			'main-column': true
		} );

		return (
			<div className={ containerClass } role="main">
				<SidebarNavigation />
				<DraftList { ...this.props } />
			</div>
		);
	}
} );
