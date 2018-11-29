/** @format */

/**
 * Publicize settings button component.
 *
 * Component which allows user to click to open settings
 * in a new window/tab. If window/tab is closed, then
 * connections will be automatically refreshed.
 */

// Since this is a Jetpack originated block in Calypso codebase,
// we're relaxing some accessibility rules.
/* eslint jsx-a11y/anchor-is-valid: 0 */
/* eslint jsx-a11y/click-events-have-key-events: 0 */
/* eslint jsx-a11y/no-static-element-interactions: 0 */
/* eslint jsx-a11y/no-noninteractive-tabindex: 0 */

/**
 * External dependencies
 */
import classnames from 'classnames';
import { Component } from '@wordpress/element';
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';
import { getSiteFragment } from 'lib/route/path';

class PublicizeSettingsButton extends Component {
	getButtonLink() {
		const siteFragment = getSiteFragment( window.location.pathname );

		// WP.com wp-admin will expose a window._currentSiteId with the current site ID
		// and for Calypso we'll detect the site fragment from the current route.
		//
		// If running in WP.com wp-admin or in Calypso, we redirect to Calypso sharing settings.
		if ( window._currentSiteId || ! includes( [ 'post.php', 'post-new.php' ], siteFragment ) ) {
			const siteId = window._currentSiteId || siteFragment;
			return `https://wordpress.com/sharing/${ siteId }`;
		}

		// Running in WordPress.org wp-admin will currently lead to Sharing settings in wp-admin.
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
				<a onClick={ this.settingsClick } tabIndex="0">
					<span className="jetpack-publicize-add-icon dashicons-plus-alt" />
					{ __( 'Connect new service' ) }
				</a>
			</div>
		);
	}
}

export default PublicizeSettingsButton;
