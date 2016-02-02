/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var Connection = require( './connection' ),
	serviceConnections = require( './service-connections' ),
	analytics = require( 'analytics' );

module.exports = React.createClass( {
	displayName: 'SharingServiceConnectedAccounts',

	propTypes: {
		site: React.PropTypes.object,                    // The site for which the connections were created
		user: React.PropTypes.object,                    // A user object
		service: React.PropTypes.object.isRequired,      // The service object
		connections: React.PropTypes.array,              // Set of connections for the service
		onAddConnection: React.PropTypes.func,           // Handler to invoke when adding a new connection
		onRemoveConnection: React.PropTypes.func,        // Handler to invoke when removing an existing connection
		isDisconnecting: React.PropTypes.bool,           // Whether a disconnect request is pending
		onRefreshConnection: React.PropTypes.func,       // Handler to invoke when refreshing a connection
		isRefreshing: React.PropTypes.bool,              // Whether a connection refresh is pending
		onToggleSitewideConnection: React.PropTypes.func // Handler to invoke when toggling a connection to be shared sitewide
	},

	getDefaultProps: function() {
		return {
			connections: Object.freeze( [] ),
			onAddConnection: function() {},
			onRemoveConnection: function() {},
			isDisconnecting: false,
			onRefreshConnection: function() {},
			isRefreshing: false,
			onToggleSitewideConnection: function() {}
		};
	},

	getConnectionElements: function() {
		return this.props.connections.map( function( connection ) {
			return <Connection
				key={ connection.keyring_connection_ID }
				site={ this.props.site }
				user={ this.props.user }
				connection={ connection }
				service={ this.props.service }
				onDisconnect={ this.props.onRemoveConnection }
				isDisconnecting={ this.props.isDisconnecting }
				showDisconnect={ this.props.connections.length > 1 || 'broken' === connection.status }
				onRefresh={ this.props.onRefreshConnection }
				isRefreshing={ this.props.isRefreshing }
				onToggleSitewideConnection={ this.props.onToggleSitewideConnection } />;
		}, this );
	},

	getConnectAnotherElement: function() {
		if ( serviceConnections.supportsMultipleConnectionsPerSite( this.props.service.name ) ) {
			return (
				<a onClick={ this.connectAnother } className="button new-account">
					{ this.translate( 'Connect a different account', { comment: 'Sharing: Publicize connections' } ) }
				</a>
			);
		}
	},

	connectAnother: function() {
		this.props.onAddConnection();
		analytics.ga.recordEvent( 'Sharing', 'Clicked Connect Another Account Button', this.props.service.name );
	},

	render: function() {
		return (
			<div className="sharing-service-accounts-detail">
				<ul className="sharing-service-connected-accounts">
					{ this.getConnectionElements() }
				</ul>
				{ this.getConnectAnotherElement() }
			</div>
		);
	}
} );
