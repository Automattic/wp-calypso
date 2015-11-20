/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var CurrentThemeStore = require( 'lib/themes/stores/current-theme' );

function getState( props ) {
	return {
		isActivating: CurrentThemeStore.isActivating(),
		hasActivated: CurrentThemeStore.hasActivated(),
		currentTheme: CurrentThemeStore.getCurrentTheme( props.siteId )
	};
}

/**
 * Passes the activating state of themes to the supplied child component.
 */
var ActivatingThemeData = React.createClass( {

	propTypes: {
		children: React.PropTypes.element.isRequired
	},

	getInitialState: function() {
		return getState( this.props );
	},

	componentWillMount: function() {
		CurrentThemeStore.on( 'change', this.onActivatingTheme );
	},

	componentWillUnmount: function() {
		CurrentThemeStore.off( 'change', this.onActivatingTheme );
	},

	onActivatingTheme: function() {
		this.setState( getState( this.props ) );
	},

	render: function() {
		return React.cloneElement( this.props.children, this.state );
	}
} );

module.exports = ActivatingThemeData;
