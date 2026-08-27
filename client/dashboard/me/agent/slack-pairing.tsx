import { wordpressAgentSlackPairMutation } from '@automattic/api-queries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { __, sprintf } from '@wordpress/i18n';
import SlackMark from 'calypso/assets/images/logos/slack-mark.svg';
import { useAnalytics } from '../../app/analytics';
import { useAuth } from '../../app/auth';
import PairingCard, { getAccountLabel, getErrorMessage } from './pairing-card';

interface SlackPairingProps {
	pairToken: string;
	onConnected: () => void;
	onCancel: () => void;
}

export default function SlackPairing( { pairToken, onConnected, onCancel }: SlackPairingProps ) {
	const { recordTracksEvent } = useAnalytics();
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const pairMutation = useMutation( wordpressAgentSlackPairMutation( queryClient ) );

	const username = getAccountLabel( user );
	const title = username
		? sprintf(
				/* translators: %s is the WordPress.com user's display name and/or username. */
				__( 'Connect your WordPress.com account %s to this Slack workspace?' ),
				username
		  )
		: __( 'Connect your WordPress.com account to this Slack workspace?' );

	const pair = () => {
		pairMutation.mutate( pairToken, {
			onSuccess: () => {
				recordTracksEvent( 'calypso_wordpress_agent_slack_pair_success' );
				onConnected();
			},
			onError: () => {
				recordTracksEvent( 'calypso_wordpress_agent_slack_pair_error' );
			},
		} );
	};

	return (
		<PairingCard
			decoration={ <img src={ SlackMark } alt="" width={ 24 } height={ 24 } /> }
			title={ title }
			description={ __(
				'WordPress Agent is already installed in this workspace. Connect your account to use your WordPress.com sites when you message it here.'
			) }
			error={
				pairMutation.error
					? getErrorMessage( pairMutation.error, __( 'Could not connect your Slack account.' ) )
					: undefined
			}
			connectLabel={ __( 'Connect account' ) }
			isBusy={ pairMutation.isPending }
			onConnect={ pair }
			onCancel={ onCancel }
		/>
	);
}
