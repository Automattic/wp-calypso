import {
	wordpressAgentSlackConnectionsQuery,
	wordpressAgentSlackDisconnectMutation,
	wordpressAgentSlackOauthMutation,
} from '@automattic/api-queries';
import { Badge } from '@automattic/ui';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Notice, Spinner, __experimentalVStack as VStack } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import SlackMark from 'calypso/assets/images/logos/slack-mark.svg';
import { useAnalytics } from '../../app/analytics';
import { Card, CardBody, CardDivider } from '../../components/card';
import { SectionHeader } from '../../components/section-header';
import type { ReactNode } from 'react';

interface WordPressAgentSlackProps {
	slackStatus?: string;
}

function getErrorMessage( error: unknown, fallback: string ): string {
	return error instanceof Error && error.message ? error.message : fallback;
}

export default function WordPressAgentSlack( { slackStatus }: WordPressAgentSlackProps ) {
	const { recordTracksEvent } = useAnalytics();
	const queryClient = useQueryClient();
	const connectionsQuery = useQuery( wordpressAgentSlackConnectionsQuery() );
	const oauthMutation = useMutation( wordpressAgentSlackOauthMutation() );
	const disconnectMutation = useMutation( wordpressAgentSlackDisconnectMutation( queryClient ) );

	const isActionPending = oauthMutation.isPending || disconnectMutation.isPending;
	const error = connectionsQuery.error || oauthMutation.error || disconnectMutation.error;
	let errorFallback: string = __( 'Could not load your Slack connections.' );
	if ( oauthMutation.error ) {
		errorFallback = __( 'Could not start Slack installation.' );
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
								<Badge intent="info">{ __( 'Integration owner' ) }</Badge>
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
		connectionsContent = (
			<CardBody>
				{ __( 'You have not connected WordPress Agent to a Slack workspace yet.' ) }
			</CardBody>
		);
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
			{ error && (
				<Notice status="error" isDismissible={ false }>
					{ getErrorMessage( error, errorFallback ) }
				</Notice>
			) }

			<Card>
				<CardBody className="wordpress-agent-connection__row">
					<SectionHeader
						level={ 3 }
						title={ __( 'Slack' ) }
						description={ __( 'Add WordPress Agent to your Slack workspaces.' ) }
					/>
					<Button
						variant="primary"
						className="wordpress-agent-slack__install-button"
						onClick={ install }
						isBusy={ oauthMutation.isPending }
						disabled={ isActionPending }
					>
						<img src={ SlackMark } alt="" width={ 20 } height={ 20 } />
						{ __( 'Add to Slack' ) }
					</Button>
				</CardBody>

				<CardDivider />
				{ connectionsContent }
			</Card>
		</VStack>
	);
}
