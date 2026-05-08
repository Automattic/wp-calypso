import './connection-reauth-gate.scss';

import { Button, Card, CardBody, __experimentalVStack as VStack } from '@wordpress/components';
import { Icon, update } from '@wordpress/icons';
import { ReactNode } from 'react';

interface ConnectionReauthGateProps {
	connectionId: number;
	useAuthStatus: ( connectionId: number ) => { needsReauth?: boolean };
	headline: string;
	body: ReactNode;
	buttonLabel: string;
	children: ReactNode;
	onReconnect: () => void;
	// True while the consumer is starting the OAuth handshake (the authorize
	// mutation is in flight). The button shows a spinner and stays disabled so
	// a second click can't fire a redundant authorize() while the first is
	// still resolving the redirect URL.
	isReconnecting?: boolean;
}

export function ConnectionReauthGate( {
	connectionId,
	useAuthStatus,
	headline,
	body,
	buttonLabel,
	children,
	onReconnect,
	isReconnecting,
}: ConnectionReauthGateProps ) {
	const { needsReauth } = useAuthStatus( connectionId );

	if ( needsReauth !== true ) {
		// Render children both for the healthy case (false) and the unknown case
		// (undefined / loading / error). Don't gate users out on our own infra
		// flakiness — if a reauth is genuinely needed, a per-action 401 will
		// invalidate auth-status and we'll re-render with the overlay.
		return <>{ children }</>;
	}

	return (
		<div className="connection-reauth-gate" role="status" aria-live="polite">
			<Card className="connection-reauth-gate__card">
				<CardBody>
					<VStack spacing={ 3 } alignment="center">
						<div className="connection-reauth-gate__icon" aria-hidden="true">
							<Icon icon={ update } size={ 32 } />
						</div>
						<h2 className="connection-reauth-gate__headline">{ headline }</h2>
						<p className="connection-reauth-gate__body">{ body }</p>
						<Button
							variant="primary"
							onClick={ onReconnect }
							isBusy={ isReconnecting }
							disabled={ isReconnecting }
						>
							{ buttonLabel }
						</Button>
					</VStack>
				</CardBody>
			</Card>
		</div>
	);
}
