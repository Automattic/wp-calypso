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
import SocialLogo from 'social-logos';
import { Component } from '@wordpress/element';
import { FormToggle } from '@wordpress/components';

class PublicizeConnection extends Component {
	/**
	 * Handler for when connection is enabled/disabled.
	 *
	 * Calls parent's change handler in this.prop so
	 * state change can be handled by parent.
	 */
	onConnectionChange = () => {
		const { unique_id } = this.props.connectionData;
		const { connectionChange, connectionOn } = this.props;
		connectionChange( {
			connectionID: unique_id,
			shouldShare: ! connectionOn,
		} );
	};

	render() {
		const { service_name: name, disabled, display_name, unique_id } = this.props.connectionData;
		const { connectionOn } = this.props;
		const id = 'connection-' + name + '-' + unique_id;
		// Genericon names are dash separated
		const socialName = name.replace( '_', '-' );

		return (
			<li>
				<div className="publicize-jetpack-connection-container">
					<label htmlFor={ id } className="jetpack-publicize-connection-label">
						<SocialLogo
							icon={ socialName }
							size={ 24 }
							className="jetpack-publicize-gutenberg-social-icon"
						/>
						<span>{ display_name }</span>
					</label>
					<FormToggle
						id={ id }
						className="jetpack-publicize-connection-toggle"
						checked={ connectionOn }
						onChange={ this.onConnectionChange }
						disabled={ disabled }
					/>
				</div>
			</li>
		);
	}
}

export default PublicizeConnection;
