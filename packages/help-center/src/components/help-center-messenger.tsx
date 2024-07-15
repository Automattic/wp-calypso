/**
 * External Dependencies
 */
import { useMessagingAuth } from '@automattic/help-center/src/hooks';
import { useEffect } from 'react';
import Smooch from 'smooch';
/**
 * Internal Dependencies
 */
import { BackButton } from './back-button';

export function HelpCenterMessenger(): JSX.Element {
	const { data: authData } = useMessagingAuth( true, 'messenger' );
	useEffect( () => {
		if ( ! authData?.jwt ) {
			return;
		}

		Smooch.init( {
			integrationId: '6453b7fc45cea5c267e60fed',
			embedded: true,
			configBaseUrl: 'https://wpcomsupport.zendesk.com/sc/sdk',
			businessIconUrl: 'https://wpcomsupport.zendesk.com/embeddable/avatars/19034438422164',
			customColors: {
				brandColor: '0675C4',
			},
			externalId: authData?.externalId,
			jwt: authData?.jwt,
		} as InitOptions );
		const messengerContainer = document.getElementById( 'messenger-container' );
		if ( messengerContainer ) {
			Smooch.render( messengerContainer );
		}
	}, [ authData?.jwt, authData?.externalId ] );

	return (
		<div className="help-center__container-content-odie">
			<div className="help-center__container-odie-header">
				<BackButton className="help-center__container-odie-back-button" />
			</div>
			<div style={ { width: '100%', height: '100%' } } id="messenger-container"></div>
		</div>
	);
}
