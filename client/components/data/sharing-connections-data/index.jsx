/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var connections = require( 'lib/connections-list' )(),
	user = require( 'lib/user' )(),
	passToChildren = require( 'lib/react-pass-to-children' );

function getConnectionsByUserId( siteId, userId ) {
	var userConnections;

	if ( undefined === userId ) {
		userId = ( user.get() || {} ).ID;
	}

	userConnections = connections.get( siteId, {
		userId: userId
	} );

	if ( ! connections.initialized ) {
		return;
	}

	return userConnections;
}

function getStateData( siteId, userId ) {
	return {
		connections: getConnectionsByUserId( siteId, userId )
	};
}

module.exports = React.createClass( {
	displayName: 'SharingConnectionsData',

	propTypes: {
		siteId: React.PropTypes.number.isRequired,
		userId: React.PropTypes.number
	},

	getInitialState: function() {
		return getStateData( this.props.siteId, this.props.userId );
	},

	componentDidMount: function() {
		connections.on( 'change', this.updateState );
	},

	componentWillUnmount: function() {
		connections.off( 'change', this.updateState );
	},

	componentWillReceiveProps: function( nextProps ) {
		if ( this.props.siteId !== nextProps.siteId ) {
			this.setState( getStateData( nextProps.siteId, nextProps.userId ) );
		}
	},

	updateState: function() {
		this.setState( getStateData( this.props.siteId, this.props.userId ) );
	},

	render: function() {
		return passToChildren( this, this.state );
	}
} );
