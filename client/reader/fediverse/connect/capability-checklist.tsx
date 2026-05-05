import { Button, Spinner, __experimentalVStack as VStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import type { WizardState, WizardStateName } from './wizard-types';

interface Props {
	state: WizardState;
	onConnect: () => void;
}

const IN_FLIGHT_STATES: WizardStateName[] = [
	'CHECKING_CAPABILITIES',
	'ENABLING_FEATURE',
	'ENABLING_C2S',
	'ENABLING_USER_ACTORS',
	'AUTHORIZING',
	'REDIRECTING',
];

function ChecklistIcon( { checked, spinning }: { checked: boolean; spinning: boolean } ) {
	if ( spinning ) {
		return <Spinner />;
	}
	if ( checked ) {
		return <span aria-hidden="true">✓</span>;
	}
	return <span aria-hidden="true">☐</span>;
}

interface RowProps {
	label: string;
	checked: boolean;
	spinning: boolean;
}

function ChecklistRow( { label, checked, spinning }: RowProps ) {
	return (
		<div className="fediverse-capability-checklist__row">
			<ChecklistIcon checked={ checked } spinning={ spinning } />
			<span>{ label }</span>
		</div>
	);
}

export function CapabilityChecklist( { state, onConnect }: Props ) {
	const translate = useTranslate();

	// While capabilities are still loading, show a spinner.
	if ( state.name === 'CHECKING_CAPABILITIES' && state.capabilities === null ) {
		return <Spinner />;
	}

	const caps = state.capabilities;
	const currentName = state.name;

	// Row 1: ActivityPub feature
	const featureLabel =
		caps?.site_kind === 'jetpack'
			? translate( 'Install ActivityPub plugin' )
			: translate( 'Enable ActivityPub feature' );
	const featureChecked = caps?.activitypub_active ?? false;
	const featureSpinning = currentName === 'ENABLING_FEATURE';

	// Row 2: C2S API
	const c2sLabel = translate( 'Enable Client-to-Server posting API' );
	const c2sChecked = caps?.c2s_enabled ?? false;
	const c2sSpinning = currentName === 'ENABLING_C2S';

	// Row 3: Per-user actors
	const actorsLabel = translate( 'Enable per-user accounts' );
	const actorsChecked = caps?.actors.user.enabled ?? false;
	const actorsSpinning = currentName === 'ENABLING_USER_ACTORS';

	// Row 4: Authorize
	const siteHost = caps?.site_host ?? '';
	const authorizeLabel = translate( 'Authorize WordPress.com to post as @you@%(siteHost)s', {
		args: { siteHost },
	} );
	const authorizeChecked = false;
	const authorizeSpinning = currentName === 'AUTHORIZING' || currentName === 'REDIRECTING';

	// Button state
	const isInFlight = IN_FLIGHT_STATES.includes( currentName );

	let buttonDisabled = isInFlight;
	let disabledMessage: string | null = null;

	if ( caps?.current_user_can_publish === false ) {
		buttonDisabled = true;
		disabledMessage = translate(
			'You need permission to publish on this site to connect.'
		) as string;
	} else if ( caps?.actors.user.enabled === false && caps?.actors.user.can_enable === false ) {
		buttonDisabled = true;
		disabledMessage = translate(
			'You need administrator permissions on this site to enable Fediverse posting.'
		) as string;
	}

	return (
		<VStack spacing={ 4 }>
			<div className="fediverse-capability-checklist">
				<ChecklistRow
					label={ featureLabel as string }
					checked={ featureChecked }
					spinning={ featureSpinning }
				/>
				<ChecklistRow
					label={ c2sLabel as string }
					checked={ c2sChecked }
					spinning={ c2sSpinning }
				/>
				<ChecklistRow
					label={ actorsLabel as string }
					checked={ actorsChecked }
					spinning={ actorsSpinning }
				/>
				<ChecklistRow
					label={ authorizeLabel as string }
					checked={ authorizeChecked }
					spinning={ authorizeSpinning }
				/>
			</div>
			{ disabledMessage && (
				<p className="fediverse-capability-checklist__disabled-message">{ disabledMessage }</p>
			) }
			<Button
				variant="primary"
				disabled={ buttonDisabled }
				isBusy={ isInFlight }
				onClick={ onConnect }
			>
				{ translate( 'Enable & Connect' ) }
			</Button>
		</VStack>
	);
}
