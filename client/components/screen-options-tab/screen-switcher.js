/**
 * External Dependencies
 */
import React from 'react';
import { useI18n } from '@wordpress/react-i18n';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getSiteAdminUrl } from 'calypso/state/sites/selectors';
import { addQueryArgs } from 'calypso/lib/route';

/**
 * Style dependencies
 */
import './style.scss';

const ScreenSwitcher = ( { onSwitch, wpAdminPath } ) => {
	const { __ } = useI18n();

	const siteId = useSelector( getSelectedSiteId );
	let fullWpAdminUrl = useSelector( ( state ) => getSiteAdminUrl( state, siteId, wpAdminPath ) );

	// We indicate that the WP Admin view is preferred with the `preferred-view` query param. WP Admin will
	// use that param to store the preference, so next times the user visits the page via the sidebar menu
	// it will default to the WP Admin page.
	fullWpAdminUrl = addQueryArgs( { 'preferred-view': 'classic' }, fullWpAdminUrl );

	return (
		<div className="screen-switcher">
			<button
				className="screen-switcher__button"
				onClick={ () => onSwitch && onSwitch( 'default' ) }
			>
				<strong>{ __( 'Default view' ) }</strong>
				{ __( 'Our WordPress.com redesign for a better experience.' ) }
			</button>
			<a
				className="screen-switcher__button"
				onClick={ () => onSwitch && onSwitch( 'classic' ) }
				href={ fullWpAdminUrl }
			>
				<strong>{ __( 'Classic view' ) }</strong>
				{ __( 'The classic WP-Admin WordPress interface.' ) }
			</a>
		</div>
	);
};

export default ScreenSwitcher;
