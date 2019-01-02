/** @format */

/**
 * Publicize connection form component.
 *
 * Component to display connection label and a
 * checkbox to enable/disable the connection for sharing.
 */

/**
 * External dependencies
 */
import { Component } from '@wordpress/element';
import { Disabled, FormToggle } from '@wordpress/components';
import { withSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import PublicizeServiceIcon from './service-icon';

class PublicizeConnection extends Component {
	onConnectionChange = () => {
		const { id } = this.props;
		this.props.toggleConnection( id );
	};

	connectionIsFailing() {
		const { failedConnections, name } = this.props;
		return failedConnections.some( connection => connection.service_name === name );
	}

	render() {
		const { disabled, enabled, id, label, name } = this.props;
		const fieldId = 'connection-' + name + '-' + id;
		// Genericon names are dash separated
		const serviceName = name.replace( '_', '-' );

		let toggle = (
			<FormToggle
				id={ fieldId }
				className="jetpack-publicize-connection-toggle"
				checked={ enabled }
				onChange={ this.onConnectionChange }
			/>
		);

		if ( disabled || this.connectionIsFailing() ) {
			toggle = <Disabled>{ toggle }</Disabled>;
		}

		return (
			<li>
				<div className="publicize-jetpack-connection-container">
					<label htmlFor={ fieldId } className="jetpack-publicize-connection-label">
						<PublicizeServiceIcon serviceName={ serviceName } />
						<span className="jetpack-publicize-connection-label-copy">{ label }</span>
					</label>
					{ toggle }
				</div>
			</li>
		);
	}
}

export default withSelect( select => ( {
	failedConnections: select( 'jetpack/publicize' ).getFailedConnections(),
} ) )( PublicizeConnection );
