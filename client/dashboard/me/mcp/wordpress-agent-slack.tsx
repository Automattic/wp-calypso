import {
	wordpressAgentSlackConnectionsQuery,
	wordpressAgentSlackDisconnectMutation,
	wordpressAgentSlackOauthMutation,
	wordpressAgentSlackPairMutation,
} from '@automattic/api-queries';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Notice, Spinner, __experimentalVStack as VStack } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { Badge } from '@wordpress/ui';
import { useState } from 'react';
import SlackMark from 'calypso/assets/images/logos/slack-mark.svg';
import { useAnalytics } from '../../app/analytics';
import { useAuth } from '../../app/auth';
import { Card, CardBody, CardDivider } from '../../components/card';
import { SectionHeader } from '../../components/section-header';
import type { ReactNode } from 'react';

interface WordPressAgentSlackProps {
	pairToken?: string;
	slackStatus?: string;
}

function getErrorMessage( error: unknown, fallback: string ): string {
	return error instanceof Error && error.message ? error.message : fallback;
}

export default function WordPressAgentSlack( {
	pairToken,
	slackStatus,
}: WordPressAgentSlackProps ) {
	const { recordTracksEvent } = useAnalytics();
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const [ paired, setPaired ] = useState( false );
	const connectionsQuery = useQuery( wordpressAgentSlackConnectionsQuery() );
	const oauthMutation = useMutation( wordpressAgentSlackOauthMutation() );
	const pairMutation = useMutation( wordpressAgentSlackPairMutation( queryClient ) );
	const disconnectMutation = useMutation( wordpressAgentSlackDisconnectMutation( queryClient ) );

	const displayName = user.display_name;
	const username =
		displayName && user.username && displayName !== user.username
			? `${ displayName } (@${ user.username })`
			: displayName || user.username;
	const pairingTitle = username
		? sprintf(
				/* translators: %s is the WordPress.com user's display name and/or username. */
				__( 'Connect your WordPress.com account %s to this Slack workspace?' ),
				username
		  )
		: __( 'Connect your WordPress.com account to this Slack workspace?' );
	const installTitle = __( 'Slack' );
	const installDescription = pairToken
		? __( 'This is a separate step for adding WordPress Agent to a different Slack workspace.' )
		: __( 'Add your agent to Slack and manage your sites from there.' );
	const isActionPending =
		oauthMutation.isPending || pairMutation.isPending || disconnectMutation.isPending;
	const error =
		connectionsQuery.error || oauthMutation.error || pairMutation.error || disconnectMutation.error;
	let errorFallback: string = __( 'Could not load your Slack connections.' );
	if ( oauthMutation.error ) {
		errorFallback = __( 'Could not start Slack installation.' );
	} else if ( pairMutation.error ) {
		errorFallback = __( 'Could not connect your Slack account.' );
	} else if ( disconnectMutation.error ) {
		errorFallback = __( 'Could not disconnect this workspace.' );
	}

	const install = () => {
		oauthMutation.mutate( undefined, {
			onSuccess: ( response ) => {
				recordTracksEvent( 'calypso_wordpress_agent_slack_install_started' );
				window.location.assign( response.authorize_url );
			},
		} );
	};

	const pair = () => {
		if ( ! pairToken ) {
			return;
		}

		pairMutation.mutate( pairToken, {
			onSuccess: () => {
				recordTracksEvent( 'calypso_wordpress_agent_slack_pair_success' );
				setPaired( true );
			},
			onError: () => {
				recordTracksEvent( 'calypso_wordpress_agent_slack_pair_error' );
			},
		} );
	};

	const disconnect = ( teamId: string ) => {
		disconnectMutation.mutate( teamId, {
			onSuccess: () => {
				recordTracksEvent( 'calypso_wordpress_agent_slack_disconnect' );
			},
		} );
	};
	let connectionsContent: ReactNode;
	if ( connectionsQuery.isLoading ) {
		connectionsContent = (
			<div className="wordpress-agent-slack__loading">
				<Spinner />
			</div>
		);
	} else if ( connectionsQuery.data?.length ) {
		connectionsContent = connectionsQuery.data.map( ( connection, index ) => (
			<div key={ connection.team_id }>
				{ index > 0 && <CardDivider /> }
				<CardBody className="wordpress-agent-connection__row">
					<SectionHeader
						level={ 3 }
						title={ connection.team_name }
						actions={
							connection.installed && connection.is_owner ? (
								<Badge intent="informational">{ __( 'Integration owner' ) }</Badge>
							) : undefined
						}
						description={
							connection.installed
								? createInterpolateElement(
										__( 'Your account is <connected>connected</connected>.' ),
										{ connected: <strong /> }
								  )
								: __( 'The app is no longer installed in this workspace.' )
						}
					/>
					<Button
						__next40pxDefaultSize
						variant="secondary"
						isDestructive
						onClick={ () => disconnect( connection.team_id ) }
						isBusy={
							disconnectMutation.isPending && disconnectMutation.variables === connection.team_id
						}
						disabled={ isActionPending }
					>
						{ __( 'Disconnect' ) }
					</Button>
				</CardBody>
			</div>
		) );
	} else {
		connectionsContent = null;
	}

	return (
		<VStack spacing={ 4 }>
			{ slackStatus === 'connected' && (
				<Notice status="success" isDismissible={ false }>
					{ __( 'WordPress Agent was installed successfully.' ) }
				</Notice>
			) }
			{ slackStatus && slackStatus !== 'connected' && (
				<Notice status="error" isDismissible={ false }>
					{ __( 'Slack installation could not be completed. Please try again.' ) }
				</Notice>
			) }
			{ paired && (
				<Notice status="success" isDismissible={ false }>
					{ __( 'Your Slack account is connected.' ) }
				</Notice>
			) }
			{ error && (
				<Notice status="error" isDismissible={ false }>
					{ getErrorMessage( error, errorFallback ) }
				</Notice>
			) }

			{ pairToken && ! paired && (
				<Card>
					<CardBody className="wordpress-agent-connection__row">
						<SectionHeader
							level={ 3 }
							title={ pairingTitle }
							description={ __(
								'WordPress Agent is already installed in this workspace. Connect your account to use your WordPress.com sites when you message it here.'
							) }
						/>
						<Button
							__next40pxDefaultSize
							variant="primary"
							onClick={ pair }
							isBusy={ pairMutation.isPending }
							disabled={ isActionPending }
						>
							{ __( 'Connect account' ) }
						</Button>
					</CardBody>
				</Card>
			) }

			<Card>
				<CardBody className="wordpress-agent-connection__row">
					<SectionHeader level={ 3 } title={ installTitle } description={ installDescription } />
					<Button
						__next40pxDefaultSize
						variant="primary"
						className="wordpress-agent-slack__install-button"
						onClick={ install }
						isBusy={ oauthMutation.isPending }
						disabled={ isActionPending }
					>
						<img src={ SlackMark } alt="" width={ 20 } height={ 20 } />
						{ pairToken ? __( 'Add to another workspace' ) : __( 'Add to Slack' ) }
					</Button>
				</CardBody>

				{ connectionsContent && (
					<>
						<CardDivider />
						{ connectionsContent }
					</>
				) }
			</Card>
		</VStack>
	);
}
