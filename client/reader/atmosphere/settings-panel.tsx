import { useDisconnectConnectionMutation } from '@automattic/api-queries';
import page from '@automattic/calypso-router';
import {
	Button,
	Card,
	CardBody,
	Modal,
	Notice,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useTranslate, type TranslateResult } from 'i18n-calypso';
import { useState } from 'react';
import { atmosphereErrorMessage } from './error-messages';
import type { AtmosphereConnection } from '@automattic/api-core';

interface SettingsPanelProps {
	connection: AtmosphereConnection;
}

export function SettingsPanel( { connection }: SettingsPanelProps ) {
	const translate = useTranslate();
	const [ isModalOpen, setIsModalOpen ] = useState( false );
	const disconnect = useDisconnectConnectionMutation();

	const disconnectLabel = translate( 'Disconnect @%(handle)s', {
		args: { handle: connection.handle },
	} ) as string;

	const openModal = () => setIsModalOpen( true );
	const closeModal = () => {
		setIsModalOpen( false );
		disconnect.reset();
	};

	const confirmDisconnect = () => {
		disconnect.mutate( connection.id, {
			onSuccess: () => {
				setIsModalOpen( false );
				page.replace( '/reader/atmosphere' );
			},
		} );
	};

	return (
		<>
			<Card>
				<CardBody>
					<VStack spacing={ 4 } alignment="left">
						<h2>{ translate( 'Disconnect this account' ) }</h2>
						<p>
							{ translate(
								'Stop bringing {{strong}}@%(handle)s{{/strong}} into the Reader. You can reconnect any time.',
								{
									args: { handle: connection.handle },
									components: { strong: <strong /> },
								}
							) }
						</p>
						<div>
							<Button
								variant="secondary"
								isDestructive
								onClick={ openModal }
								aria-label={ disconnectLabel }
							>
								{ translate( 'Disconnect' ) }
							</Button>
						</div>
					</VStack>
				</CardBody>
			</Card>
			{ isModalOpen ? (
				<Modal
					title={ translate( 'Disconnect Bluesky account' ) }
					onRequestClose={ closeModal }
					shouldCloseOnEsc={ ! disconnect.isPending }
					shouldCloseOnClickOutside={ ! disconnect.isPending }
				>
					<VStack spacing={ 4 }>
						<p>
							{ translate( 'Disconnect {{strong}}@%(handle)s{{/strong}} from the Reader?', {
								args: { handle: connection.handle },
								components: { strong: <strong /> },
							} ) }
						</p>
						<Notice status="warning" isDismissible={ false }>
							{ translate(
								'Disconnecting will stop bringing this Bluesky account into the Reader.'
							) }
						</Notice>
						{ connection.publicize_site_count > 0 ? (
							<Notice status="warning" isDismissible={ false }>
								{ publicizeWarning( connection.publicize_site_count, translate ) }
							</Notice>
						) : null }
						{ disconnect.error ? (
							<p className="atmosphere-error" role="alert">
								{ atmosphereErrorMessage( disconnect.error, translate ) }
							</p>
						) : null }
						<HStack justify="flex-end" spacing={ 2 }>
							<Button variant="tertiary" onClick={ closeModal } disabled={ disconnect.isPending }>
								{ translate( 'Cancel' ) }
							</Button>
							<Button
								variant="primary"
								isDestructive
								isBusy={ disconnect.isPending }
								disabled={ disconnect.isPending }
								onClick={ confirmDisconnect }
							>
								{ translate( 'Disconnect' ) }
							</Button>
						</HStack>
					</VStack>
				</Modal>
			) : null }
		</>
	);
}

function publicizeWarning(
	count: number,
	translate: ReturnType< typeof useTranslate >
): TranslateResult {
	return translate(
		'This account is used to share posts to Bluesky via Jetpack Social from %(count)d site. Disconnecting will stop those shares.',
		'This account is used to share posts to Bluesky via Jetpack Social from %(count)d sites. Disconnecting will stop those shares.',
		{
			count,
			args: { count },
		}
	);
}
