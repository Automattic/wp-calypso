/**
 * External Dependencies
 */
import { useEffect } from 'react';
import Smooch from 'smooch';
/**
 * Internal Dependencies
 */
import { BackButton } from './back-button';

export function HelpCenterMessenger(): JSX.Element {
	useEffect( () => {
		Smooch.init( { integrationId: '6453b7fc45cea5c267e60fed', embedded: true } );
		const messengerContainer = document.getElementById( 'messenger-container' );
		if ( messengerContainer ) {
			Smooch.render( messengerContainer );
		}
	}, [] );
	return (
		<div className="help-center__container-content-odie">
			<div className="help-center__container-odie-header">
				<BackButton className="help-center__container-odie-back-button" />
			</div>
			<div style={ { width: '100%', height: '100%' } } id="messenger-container"></div>
		</div>
	);
}
