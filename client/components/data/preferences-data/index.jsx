/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var PreferencesActions = require( 'lib/preferences/actions' ),
	PreferencesStore = require( 'lib/preferences/store' ),
	passToChildren = require( 'lib/react-pass-to-children' );

function getStateData() {
	return {
		preferences: PreferencesStore.getAll()
	};
}

module.exports = React.createClass( {
	displayName: 'PreferencesData',

	getInitialState: function() {
		return getStateData();
	},

	componentDidMount: function() {
		PreferencesStore.on( 'change', this.updateState );

		if ( undefined === this.state.preferences ) {
			PreferencesActions.fetch();
		}
	},

	componentWillUnmount: function() {
		PreferencesStore.off( 'change', this.updateState );
	},

	updateState: function() {
		this.setState( getStateData() );
	},

	render: function() {
		return passToChildren( this, this.state );
	}
} );
