/**
 * Publicize connection form component.
 *
 * Component to display connection label and a
 * checkbox to enable/disable the connection for sharing.
 *
 * @since  5.9.1
 */

// Since this is a Jetpack originated block in Calypso codebase,
// we're relaxing some accessibility rules.
/* eslint jsx-a11y/label-has-for: 0 */

/**
 * External dependencies
 */
import { Component } from '@wordpress/element';
import { FormToggle } from '@wordpress/components';

class PublicizeConnection extends Component {
	/**
	 * Handler for when connection is enabled/disabled.
	 *
	 * Calls parent's change handler in this.prop so
	 * state change can be handled by parent.
	 *
	 * @since 5.9.1
	 */
	onConnectionChange = () => {
		const { unique_id } = this.props.connectionData;
		const { connectionChange, connectionOn } = this.props;
		connectionChange( {
			connectionID: unique_id,
			shouldShare: ! connectionOn,
		} );
	}

	render() {
		const {
			name,
			label,
			disabled,
			display_name,
		} = this.props.connectionData;
		const { connectionOn } = this.props;
		// Genericon names are dash separated
		const socialName = name.replace( '_', '-' );

		return (
			<li>
				<div className="publicize-jetpack-connection-container">
					<label htmlFor={ label }className="jetpack-publicize-connection-label">
						<span
							title={ label }
							className={ 'jetpack-publicize-gutenberg-social-icon social-logo social-logo__' + socialName }
						>
						</span>
						<span>{ display_name }</span>
					</label>
					<FormToggle
						id={ label }
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
