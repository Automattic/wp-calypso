/**
 * External dependencies
 */
/* eslint-disable import/no-extraneous-dependencies */
import domReady from '@wordpress/dom-ready';
import ReactDOM from 'react-dom';
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { useState } from '@wordpress/element';
/* eslint-disable import/no-extraneous-dependencies */

function LaunchButtonOverride( { defaultLabel, defaultUrl } ) {
	const [ useLaunchButton, setUseLaunchButton ] = useState( false );
	window.wp.hooks.addAction( 'updateLaunchButton', 'a8c-gutenboarding' /* ? */, data => {
		setUseLaunchButton( data.hasLaunchButtonOverride );
	} );

	const url = useLaunchButton ? '/start/frankenflow' : defaultUrl;
	const label = useLaunchButton ? __( 'Launch' ) : defaultLabel;

	return (
		<a href={ url } aria-label={ label }>
			<Button className="launch-button-override__button components-button is-primary">
				<div className="launch-button-override__label">{ label }</div>
			</Button>
		</a>
	);
}

domReady( () => {
	console.log( 'SANITY CHECK - THE DOM IS READY!' );
	const awaitSettingsBar = setInterval( () => {
		const settingsBar = document.querySelector( '.edit-post-header__settings' );

		if ( ! settingsBar ) {
			return;
		}
		clearInterval( awaitSettingsBar );

		const buttonWrapper = document.createElement( 'div' );
		settingsBar.prepend( buttonWrapper );

		const originalButton = settingsBar.querySelector( '.editor-post-publish-button' );
		const defaultLabel = originalButton.innerText;

		ReactDOM.render(
			<LaunchButtonOverride defaultLabel={ defaultLabel } defaultUrl={ null } />,
			buttonWrapper
		);
	} );
} );
