import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button, Card, CardBody, Notice, Spinner } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import wpcom from 'calypso/lib/wp';
import {
	getCurrentUserDisplayName,
	getCurrentUserName,
} from 'calypso/state/current-user/selectors';
import type { ReactNode } from 'react';

import './style.scss';

interface SlackConnection {
	team_id: string;
	team_name: string;
	slack_user_id: string;
	installed: boolean;
}

interface ConnectionsResponse {
	connections: SlackConnection[];
}

interface OAuthStartResponse {
	authorize_url: string;
}

interface WordPressAgentPageProps {
	pairToken?: string;
	slackStatus?: string;
}

const apiPath = '/wordpress-agent/slack';

function errorMessage( error: unknown, fallback: string ): string {
	return error instanceof Error && error.message ? error.message : fallback;
}

export default function WordPressAgentPage( { pairToken, slackStatus }: WordPressAgentPageProps ) {
	const translate = useTranslate();
	const displayName = useSelector( getCurrentUserDisplayName );
	const userLogin = useSelector( getCurrentUserName );
	const username =
		displayName && userLogin && displayName !== userLogin
			? `${ displayName } (@${ userLogin })`
			: displayName || userLogin;
	const [ connections, setConnections ] = useState< SlackConnection[] >( [] );
	const [ loading, setLoading ] = useState( true );
	const [ action, setAction ] = useState< string | null >( null );
	const [ error, setError ] = useState< string | null >( null );
	const [ paired, setPaired ] = useState( false );

	const loadConnections = useCallback( async () => {
		setLoading( true );
		setError( null );
		try {
			const response = await wpcom.req.get< ConnectionsResponse >( {
				path: `${ apiPath }/connections`,
				apiNamespace: 'wpcom/v2',
			} );
			setConnections( response.connections );
		} catch ( requestError ) {
			setError(
				errorMessage(
					requestError,
					translate( 'Could not load your Slack connections.' ) as string
				)
			);
		} finally {
			setLoading( false );
		}
	}, [ translate ] );

	useEffect( () => {
		void loadConnections();
	}, [ loadConnections ] );

	const install = async () => {
		setAction( 'install' );
		setError( null );
		try {
			const response = await wpcom.req.post< OAuthStartResponse >( {
				path: `${ apiPath }/oauth/start`,
				apiNamespace: 'wpcom/v2',
			} );
			recordTracksEvent( 'calypso_wordpress_agent_slack_install_started' );
			window.location.assign( response.authorize_url );
		} catch ( requestError ) {
			setError(
				errorMessage( requestError, translate( 'Could not start Slack installation.' ) as string )
			);
			setAction( null );
		}
	};

	const pair = async () => {
		if ( ! pairToken ) {
			return;
		}
		setAction( 'pair' );
		setError( null );
		try {
			await wpcom.req.post(
				{ path: `${ apiPath }/pair`, apiNamespace: 'wpcom/v2' },
				{ token: pairToken }
			);
			recordTracksEvent( 'calypso_wordpress_agent_slack_pair_success' );
			setPaired( true );
			await loadConnections();
		} catch ( requestError ) {
			recordTracksEvent( 'calypso_wordpress_agent_slack_pair_error' );
			setError(
				errorMessage( requestError, translate( 'Could not connect your Slack account.' ) as string )
			);
		} finally {
			setAction( null );
		}
	};

	const disconnect = async ( teamId: string ) => {
		setAction( teamId );
		setError( null );
		try {
			await wpcom.req.get( {
				path: `${ apiPath }/connections/${ encodeURIComponent( teamId ) }`,
				apiNamespace: 'wpcom/v2',
				method: 'DELETE',
			} );
			recordTracksEvent( 'calypso_wordpress_agent_slack_disconnect' );
			await loadConnections();
		} catch ( requestError ) {
			setError(
				errorMessage( requestError, translate( 'Could not disconnect this workspace.' ) as string )
			);
		} finally {
			setAction( null );
		}
	};

	const title = translate( 'WordPress Agent' );
	const pairingTitle = username
		? translate( 'Connect this Slack account to your WordPress.com account %(username)s?', {
				args: { username },
		  } )
		: translate( 'Connect this Slack account to your WordPress.com account?' );
	let connectionsContent: ReactNode;
	if ( loading ) {
		connectionsContent = (
			<div className="wordpress-agent-slack__loading">
				<Spinner />
			</div>
		);
	} else if ( connections.length === 0 ) {
		connectionsContent = (
			<Card>
				<CardBody>
					{ translate( 'You have not connected WordPress Agent to a Slack workspace yet.' ) }
				</CardBody>
			</Card>
		);
	} else {
		connectionsContent = connections.map( ( connection ) => (
			<Card key={ connection.team_id }>
				<CardBody className="wordpress-agent-slack__connection">
					<div>
						<h3>{ connection.team_name }</h3>
						<p>
							{ connection.installed
								? translate( 'Connected' )
								: translate( 'The app is no longer installed in this workspace.' ) }
						</p>
					</div>
					<Button
						variant="secondary"
						isDestructive
						onClick={ () => disconnect( connection.team_id ) }
						isBusy={ action === connection.team_id }
						disabled={ !! action }
					>
						{ translate( 'Disconnect' ) }
					</Button>
				</CardBody>
			</Card>
		) );
	}

	return (
		<Main className="wordpress-agent">
			<DocumentHead title={ title } />
			<PageViewTracker
				path="/me/get-apps/wordpress-agent"
				title="Me > Get Apps > WordPress Agent"
			/>
			<NavigationHeader
				navigationItems={ [] }
				title={ title }
				subtitle={ translate( 'Connect your WordPress.com account to the tools where you work.' ) }
				className="wordpress-agent__header"
			/>

			{ slackStatus === 'connected' && (
				<Notice status="success" isDismissible={ false }>
					{ translate( 'WordPress Agent was installed successfully.' ) }
				</Notice>
			) }
			{ slackStatus && slackStatus !== 'connected' && (
				<Notice status="error" isDismissible={ false }>
					{ translate( 'Slack installation could not be completed. Please try again.' ) }
				</Notice>
			) }
			{ paired && (
				<Notice status="success" isDismissible={ false }>
					{ translate( 'Your Slack account is connected.' ) }
				</Notice>
			) }
			{ error && (
				<Notice status="error" isDismissible={ false }>
					{ error }
				</Notice>
			) }

			{ pairToken && ! paired && (
				<Card>
					<CardBody className="wordpress-agent-slack__pairing">
						<div>
							<h2>{ pairingTitle }</h2>
							<p>
								{ translate(
									'WordPress Agent will use your WordPress.com account and sites when you message it in this Slack workspace.'
								) }
							</p>
						</div>
						<Button
							variant="primary"
							onClick={ pair }
							isBusy={ action === 'pair' }
							disabled={ !! action }
						>
							{ translate( 'Connect account' ) }
						</Button>
					</CardBody>
				</Card>
			) }

			<div className="wordpress-agent-slack__heading">
				<div>
					<h2>{ translate( 'Slack' ) }</h2>
					<p>
						{ translate( 'Use WordPress Agent in direct messages in any connected workspace.' ) }
					</p>
				</div>
				<Button
					variant="primary"
					onClick={ install }
					isBusy={ action === 'install' }
					disabled={ !! action }
				>
					{ translate( 'Add to Slack' ) }
				</Button>
			</div>

			{ connectionsContent }
		</Main>
	);
}
