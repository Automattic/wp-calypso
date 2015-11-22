/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var serviceConnections = require( 'my-sites/sharing/connections/service-connections' ),
	EditorSharingPublicizeConnection = require( './publicize-connection' );

module.exports = React.createClass( {
	displayName: 'EditorSharingPublicizeServices',

	propTypes: {
		post: React.PropTypes.object,
		siteId: React.PropTypes.number.isRequired,
		connections: React.PropTypes.array.isRequired,
		newConnectionPopup: React.PropTypes.func.isRequired
	},

	renderServices: function() {
		var services = serviceConnections.getServicesFromConnections( this.props.connections );

		return services.map( function( service ) {
			return (
				<li key={ service.name } className="editor-sharing__publicize-service">
					<h5 className="editor-sharing__publicize-service-heading">{ service.label }</h5>
					{ this.renderConnections( service.name ) }
				</li>
			);
		}, this );
	},

	renderConnections: function( serviceName ) {
		const connections = serviceConnections.getConnectionsAvailableToCurrentUser(
			serviceName,
			this.props.connections
		);

		return connections.map( function( connection ) {
			return (
				<EditorSharingPublicizeConnection
					key={ connection.ID }
					post={ this.props.post }
					connection={ connection }
					onRefresh={ this.props.newConnectionPopup } />
			);
		}, this );
	},

	render: function() {
		return (
			<ul className="editor-sharing__publicize-services">
				{ this.renderServices() }
			</ul>
		);
	}
} );
