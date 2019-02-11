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
import { Disabled, FormToggle, Notice, ExternalLink } from '@wordpress/components';
import { withSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';
import PublicizeServiceIcon from './service-icon';

class PublicizeConnection extends Component {
	state = {
		showGooglePlusNotice: true,
	};

	/**
	 * Hide notice when it's removed
	 */
	onRemoveGooglePlusNotice = () => {
		this.setState( {
			showGooglePlusNotice: false,
		} );
	};

	/**
	 * If this is the Google+ connection, display a notice.
	 *
	 * @param {string} serviceName Name of the connnected social network.
	 * @returns {object} Message warning users of Google+ shutting down.
	 */
	maybeDisplayGooglePlusNotice = serviceName =>
		'google-plus' === serviceName &&
		this.state.showGooglePlusNotice && (
			<Notice status="error" onRemove={ this.onRemoveGooglePlusNotice }>
				{ __(
					'Google+ will shut down in April 2019. You can keep posting with your existing Google+ connection through March.'
				) }
				<ExternalLink
					target="_blank"
					href="https://www.blog.google/technology/safety-security/expediting-changes-google-plus/"
				>
					{ __( ' Learn more' ) }.
				</ExternalLink>
			</Notice>
		);

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
				{ this.maybeDisplayGooglePlusNotice( serviceName ) }
			</li>
		);
	}
}

export default withSelect( select => ( {
	failedConnections: select( 'jetpack/publicize' ).getFailedConnections(),
} ) )( PublicizeConnection );
