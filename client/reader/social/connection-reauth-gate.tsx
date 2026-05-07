import './connection-reauth-gate.scss';

import { Button, Card, CardBody, __experimentalVStack as VStack } from '@wordpress/components';
import { Icon, update } from '@wordpress/icons';
import { ReactNode } from 'react';

interface ConnectionReauthGateProps {
	connectionId: number;
	useAuthStatus: ( connectionId: number ) => { needsReauth?: boolean };
	reconnectUrl: string;
	headline: string;
	body: ReactNode;
	buttonLabel: string;
	children: ReactNode;
	onReconnectClick?: () => void;
}

export function ConnectionReauthGate( {
	connectionId,
	useAuthStatus,
	reconnectUrl,
	headline,
	body,
	buttonLabel,
	children,
	onReconnectClick,
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
		<div className="connection-reauth-gate" role="alert" aria-live="polite">
			<Card className="connection-reauth-gate__card">
				<CardBody>
					<VStack spacing={ 3 } alignment="center">
						<div className="connection-reauth-gate__icon" aria-hidden="true">
							<Icon icon={ update } size={ 32 } />
						</div>
						<h2 className="connection-reauth-gate__headline">{ headline }</h2>
						<p className="connection-reauth-gate__body">{ body }</p>
						<Button variant="primary" href={ reconnectUrl } onClick={ onReconnectClick }>
							{ buttonLabel }
						</Button>
					</VStack>
				</CardBody>
			</Card>
		</div>
	);
}
