/* eslint-disable no-restricted-imports */
/**
 * External Dependencies
 */
import { useEffect } from 'react';
import { Smooch } from 'smooch';
/**
 * Internal Dependencies
 */
import { BackButton } from './back-button';

export function HelpCenterMessenger(): JSX.Element {
	useEffect( () => {
		Smooch.init( {
			integrationId: '624dbbd4e6b51f00f3e3864a',
			embedded: true,
		} ).then(
			function () {
				console.log( 'initialization complete' );
			},
			function ( error ) {
				console.log( 'initialization error', error );
			}
		);

		const messengerContainer = document.getElementById( 'messenger-container' );
		if ( messengerContainer ) {
			Smooch.render( messengerContainer );
		}
	} );
	return (
		<div className="help-center__container-content-odie">
			<div className="help-center__container-odie-header">
				<BackButton className="help-center__container-odie-back-button" />
			</div>
			<div id="messenger-container"></div>
		</div>
	);
}
