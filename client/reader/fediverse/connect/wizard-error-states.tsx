import { Button, Card, CardBody, __experimentalVStack as VStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import type { WizardState } from './wizard-types';

interface Props {
	state: WizardState;
	onRetry: () => void;
	onReset: () => void;
}

export function WizardErrorStates( { state, onRetry, onReset }: Props ) {
	const translate = useTranslate();

	let title: string;
	let showRetry = true;

	switch ( state.errorStep ) {
		case 'capability_check':
			title = translate( 'Couldn’t reach this site.' ) as string;
			break;
		case 'enable_feature':
			title = translate( 'Couldn’t enable ActivityPub on this site.' ) as string;
			break;
		case 'enable_c2s':
			title = translate( 'Couldn’t enable the C2S posting API.' ) as string;
			break;
		case 'enable_user_actors':
			title = translate( 'Couldn’t enable per-user accounts.' ) as string;
			break;
		case 'authorize':
			title = translate( 'Connection failed during authorization.' ) as string;
			break;
		case 'complete':
			title = translate(
				'Your connection couldn’t be completed. The session may have expired.'
			) as string;
			break;
		case 'permission_denied':
			title = translate(
				'You don’t have permission to enable this on this site. Ask a site administrator to enable Fediverse posting.'
			) as string;
			showRetry = false;
			break;
		default:
			title = translate( 'Something went wrong.' ) as string;
	}

	return (
		<Card>
			<CardBody>
				<VStack spacing={ 3 }>
					<p className="fediverse-wizard-error__title">{ title }</p>
					{ state.errorMessage ? (
						<p className="fediverse-wizard-error__message">{ state.errorMessage }</p>
					) : null }
					{ showRetry ? (
						<Button variant="primary" onClick={ onRetry }>
							{ translate( 'Try again' ) }
						</Button>
					) : (
						<Button variant="secondary" onClick={ onReset }>
							{ translate( 'Pick a different site' ) }
						</Button>
					) }
				</VStack>
			</CardBody>
		</Card>
	);
}
