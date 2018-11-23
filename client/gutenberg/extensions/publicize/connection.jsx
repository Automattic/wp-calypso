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

class PublicizeConnection extends Component {
	onConnectionChange = () => {
		const { id } = this.props;
		this.props.toggleConnection( id );
	};

	render() {
		const { disabled, enabled, id, label, name } = this.props;
		const fieldId = 'connection-' + name + '-' + id;
		// Genericon names are dash separated
		const socialName = name.replace( '_', '-' );

		let toggle = (
			<FormToggle
				id={ fieldId }
				className="jetpack-publicize-connection-toggle"
				checked={ enabled }
				onChange={ this.onConnectionChange }
			/>
		);

		if ( disabled ) {
			toggle = <Disabled>{ toggle }</Disabled>;
		}

		return (
			<li>
				<div className="publicize-jetpack-connection-container">
					<label htmlFor={ fieldId } className="jetpack-publicize-connection-label">
						<span
							className={
								'jetpack-publicize-gutenberg-social-icon social-logo social-logo__' + socialName
							}
						/>
						<span>{ label }</span>
					</label>
					{ toggle }
				</div>
			</li>
		);
	}
}

export default PublicizeConnection;
