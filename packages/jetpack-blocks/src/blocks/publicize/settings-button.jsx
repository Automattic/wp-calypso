/**
 * Publicize settings button component.
 *
 * Component which allows user to click to open settings
 * in a new window/tab. If window/tab is closed, then
 * connections will be automatically refreshed.
 */

/**
 * External dependencies
 */
import classnames from 'classnames';
import { Component } from '@wordpress/element';
import { ExternalLink } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { __ } from '../../utils/i18n';
import getSiteFragment from '../../shared/get-site-fragment';

class PublicizeSettingsButton extends Component {
	getButtonLink() {
		const siteFragment = getSiteFragment();

		// If running in WP.com wp-admin or in Calypso, we redirect to Calypso sharing settings.
		if ( siteFragment ) {
			return `https://wordpress.com/sharing/${ siteFragment }`;
		}

		// If running in WordPress.org wp-admin we redirect to Sharing settings in wp-admin.
		return 'options-general.php?page=sharing&publicize_popup=true';
	}

	/**
	 * Opens up popup so user can view/modify connections
	 *
	 * @param {object} event Event instance for onClick.
	 */
	settingsClick = event => {
		const href = this.getButtonLink();
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
	};

	render() {
		const className = classnames(
			'jetpack-publicize-add-connection-container',
			this.props.className
		);

		return (
			<div className={ className }>
				<ExternalLink onClick={ this.settingsClick }>{ __( 'Connect an account' ) }</ExternalLink>
			</div>
		);
	}
}

export default PublicizeSettingsButton;
