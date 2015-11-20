/**
 * External dependencies
 */
var React = require( 'react' ),
	uniq = require( 'lodash/array/uniq' );

/**
 * Internal dependencies
 */
var user = require( 'lib/user' )(),
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
		var services = uniq( this.props.connections.map( ( connection ) => {
			return {
				name: connection.service,
				label: connection.label
			};
		} ), 'name' );

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
		const currentUser = user.get();
		const connections = currentUser ? this.props.connections.filter( ( connection ) => {
			const { service, keyring_connection_user_ID, shared } = connection;
			return service === serviceName && ( shared || keyring_connection_user_ID === currentUser.ID );
		} ) : [];

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
