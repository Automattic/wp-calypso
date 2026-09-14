import { __experimentalVStack as VStack, ExternalLink, Spinner } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from 'react';
import { Text } from '../../../components/text';

import './style.scss';

interface TipaltiPayoutSettingsProps {
	iframeUrl?: string;
	isLoading?: boolean;
	iframeTitle?: string;
}

export function TipaltiPayoutSettings( {
	iframeUrl = '',
	isLoading = false,
	iframeTitle = __( 'Payout settings' ),
}: TipaltiPayoutSettingsProps ) {
	const [ iframeHeight, setIframeHeight ] = useState( '100%' );

	useEffect( () => {
		if ( ! iframeUrl ) {
			return;
		}

		let allowedOrigin: string;
		try {
			allowedOrigin = new URL( iframeUrl ).origin;
		} catch {
			return;
		}

		const handleMessage = ( event: MessageEvent ) => {
			if ( event.origin !== allowedOrigin ) {
				return;
			}
			if ( event.data?.TipaltiIframeInfo ) {
				setIframeHeight( event.data.TipaltiIframeInfo.height || '100%' );
			}
		};

		window.addEventListener( 'message', handleMessage, false );
		return () => window.removeEventListener( 'message', handleMessage, false );
	}, [ iframeUrl ] );

	return (
		<VStack spacing={ 4 }>
			<Text>
				{ createInterpolateElement(
					__(
						'Enter your bank details to start receiving payments through <a>Tipalti</a>, our secure payments platform.'
					),
					{
						a: <ExternalLink href="https://tipalti.com/" children={ null } />,
					}
				) }
			</Text>

			<div className="earn-payout-settings-iframe-container">
				{ isLoading || ! iframeUrl ? (
					<Spinner />
				) : (
					<iframe title={ iframeTitle } src={ iframeUrl } width="100%" height={ iframeHeight } />
				) }
			</div>
		</VStack>
	);
}
