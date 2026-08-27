import { wordpressAgentTelegramTokenConnectMutation } from '@automattic/api-queries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { __, sprintf } from '@wordpress/i18n';
import { useAnalytics } from '../../app/analytics';
import { useAuth } from '../../app/auth';
import PairingCard, { getAccountLabel, getErrorMessage } from './pairing-card';

interface TelegramPairingProps {
	telegramId: string;
	token: string;
	timestamp: string;
	bot?: string;
	onConnected: () => void;
	onCancel: () => void;
}

export default function TelegramPairing( {
	telegramId,
	token,
	timestamp,
	bot,
	onConnected,
	onCancel,
}: TelegramPairingProps ) {
	const { recordTracksEvent } = useAnalytics();
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const tokenMutation = useMutation( wordpressAgentTelegramTokenConnectMutation( queryClient ) );

	const username = getAccountLabel( user );
	const title = username
		? sprintf(
				/* translators: %s is the WordPress.com user's display name and/or username. */
				__( 'Connect your WordPress.com account %s to Telegram?' ),
				username
		  )
		: __( 'Connect your WordPress.com account to Telegram?' );

	const connect = () => {
		tokenMutation.mutate(
			{
				telegram_id: telegramId,
				token,
				ts: timestamp,
				...( bot && { bot } ),
			},
			{
				onSuccess: () => {
					recordTracksEvent( 'calypso_telegram_connect_via_token_success', {
						source: 'calypso_token',
					} );
					onConnected();
				},
				onError: ( error ) => {
					recordTracksEvent( 'calypso_telegram_connect_via_token_error', {
						source: 'calypso_token',
						error: error.message || 'unknown',
					} );
				},
			}
		);
	};

	return (
		<PairingCard
			title={ title }
			description={ __(
				'Connect your account to use WordPress Agent when you message it in Telegram.'
			) }
			error={
				tokenMutation.error
					? getErrorMessage(
							tokenMutation.error,
							__( 'Failed to connect Telegram. Please try again.' )
					  )
					: undefined
			}
			connectLabel={ __( 'Connect' ) }
			isBusy={ tokenMutation.isPending }
			onConnect={ connect }
			onCancel={ onCancel }
		/>
	);
}
