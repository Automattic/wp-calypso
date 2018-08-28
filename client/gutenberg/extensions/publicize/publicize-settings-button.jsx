/**
 * Publicize settings button component.
 *
 * Component which allows user to click to open settings
 * in a new window/tab. If window/tab is closed, then
 * connections will be automatically refreshed.
 *
 * @since  5.9.1
 */

// Since this is a Jetpack originated block in Calypso codebase,
// we're relaxing className and some accessibility rules.
/* eslint wpcalypso/jsx-classname-namespace: 0 */
/* eslint jsx-a11y/anchor-is-valid: 0 */
/* eslint jsx-a11y/click-events-have-key-events: 0 */
/* eslint jsx-a11y/no-static-element-interactions: 0 */
/* eslint jsx-a11y/no-noninteractive-tabindex: 0 */

/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { Component } from '@wordpress/element';

class PublicizeSettingsButton extends Component {
	/**
	 * Opens up popup so user can view/modify connections
	 *
	 * @since 5.9.1
	 *
	 * @param {object} event Event instance for onClick.
	 */
	settingsClick = ( event ) => {
		const href = 'options-general.php?page=sharing&publicize_popup=true';
		const { refreshCallback } = this.props;
		event.preventDefault();
		/**
		 * Open a popup window, and
		 * when it is closed, refresh connections
		 */
		const popupWin = window.open( href, '', '' );
		const popupTimer = window.setInterval( () => {
			if ( false !== popupWin.closed ) {
				window.clearInterval( popupTimer );
				refreshCallback();
			}
		}, 500 );
	}

	render() {
		return (
			<div className="jetpack-publicize-add-connection-container">
				<span
					className="jetpack-publicize-add-icon dashicons-plus-alt"
				>
				</span>
				<a
					onClick={ this.settingsClick }
					tabIndex="0"
				>
					{ __( 'Connect another service' ) }
				</a>
			</div>
		);
	}
}

export default PublicizeSettingsButton;
