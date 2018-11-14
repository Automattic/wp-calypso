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
import { FormToggle } from '@wordpress/components';

class PublicizeConnection extends Component {
	onConnectionChange = () => {
		const { id } = this.props.connectionData;
		this.props.toggleConnection( id );
	};

	render() {
		const { display_name, enabled, id, service_name: name, toggleable } = this.props.connectionData;
		const fieldId = 'connection-' + name + '-' + id;
		// Genericon names are dash separated
		const socialName = name.replace( '_', '-' );

		return (
			<li>
				<div className="publicize-jetpack-connection-container">
					<label htmlFor={ fieldId } className="jetpack-publicize-connection-label">
						<span
							className={
								'jetpack-publicize-gutenberg-social-icon social-logo social-logo__' + socialName
							}
						/>
						<span>{ display_name }</span>
					</label>
					<FormToggle
						id={ fieldId }
						className="jetpack-publicize-connection-toggle"
						checked={ enabled }
						onChange={ this.onConnectionChange }
						disabled={ ! toggleable }
					/>
				</div>
			</li>
		);
	}
}

export default PublicizeConnection;
