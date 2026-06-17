import {
	accountRecoveryQuery,
	userSettingsQuery,
	userPreferenceQuery,
	userPreferenceMutation,
} from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { Modal, Button, __experimentalVStack as VStack } from '@wordpress/components';
import { _n, sprintf } from '@wordpress/i18n';
import { useId, useState } from 'react';
import { useExperiment } from 'calypso/lib/explat';
import ComponentViewTracker from '../../components/component-view-tracker';
import { Text } from '../../components/text';
import { useAnalytics } from '../analytics';
import { getInterstitialCopy, getInterstitialVariant } from './copy';
import heroIllustration from './hero-illustration.png';
import type { InterstitialCta, InterstitialVariant } from './copy';
import './style.scss';

const DAY_IN_SECONDS = 86400;

/**
 * ExPlat A/B experiment gating the interstitial. Users in the `treatment` variation see the
 * modal; everyone else (control / unassigned) does not. Update this to the registered
 * experiment name when it changes.
 */
const EXPERIMENT_NAME = 'account_recovery_nudge_interstitial_experiment';

/**
 * How secure the user already is. Single source of truth for the tiers; SNOOZE_DAYS and
 * the copy map are both keyed by it, so adding a tier is a compile error until both update.
 */
type SecurityLevel = 'none' | 'partial' | 'strong';

/**
 * Snooze windows (days) by security level
 */
const SNOOZE_DAYS: Record< SecurityLevel, number > = {
	none: 14, // nothing set up
	partial: 30, // a recovery method but no 2FA or vice-versa
	strong: 365, // fully set up -> yearly periodic check
};

/**
 * QA overrides via the `?account-recovery-interstitial=<value>` query param:
 *
 * - `force` — show the modal with the user's real data, bypassing eligibility.
 * - a variant name (`none`, `add-two-factor`, `add-recovery-method`, `add-backup-codes`,
 *   `strong`) — simulate that scenario's underlying setup state (recovery email/phone, 2FA,
 *   backup codes) so the heading, copy, masked details, snooze window, and Tracks all derive
 *   from it exactly as a real user in that state would see. The real snooze is ignored.
 */
interface QaScenario {
	hasRecoveryEmail: boolean;
	hasRecoveryPhone: boolean;
	hasTwoFactor: boolean;
	hasBackupCodes: boolean;
}

const QA_SCENARIOS: Record< InterstitialVariant, QaScenario > = {
	none: {
		hasRecoveryEmail: false,
		hasRecoveryPhone: false,
		hasTwoFactor: false,
		hasBackupCodes: false,
	},
	'add-two-factor': {
		hasRecoveryEmail: true,
		hasRecoveryPhone: false,
		hasTwoFactor: false,
		hasBackupCodes: false,
	},
	'add-recovery-method': {
		hasRecoveryEmail: false,
		hasRecoveryPhone: false,
		hasTwoFactor: true,
		hasBackupCodes: false,
	},
	'add-backup-codes': {
		hasRecoveryEmail: true,
		hasRecoveryPhone: true,
		hasTwoFactor: true,
		hasBackupCodes: false,
	},
	strong: {
		hasRecoveryEmail: true,
		hasRecoveryPhone: true,
		hasTwoFactor: true,
		hasBackupCodes: true,
	},
};

function getQaParam(): string | null {
	if ( typeof window === 'undefined' ) {
		return null;
	}
	return new URLSearchParams( window.location.search ).get( 'account-recovery-interstitial' );
}

/** The simulated setup state when a variant name is passed as the QA param, else null. */
function getQaScenario(): QaScenario | null {
	const value = getQaParam();
	return value && value in QA_SCENARIOS ? QA_SCENARIOS[ value as InterstitialVariant ] : null;
}

/** Whether the modal should be force-shown for QA, bypassing eligibility. */
function isQaForced(): boolean {
	return getQaParam() === 'force' || getQaScenario() !== null;
}

/** Maps the user's account-recovery setup to a coarse security tier. */
function getSecurityLevel(
	hasRecoveryEmail: boolean,
	hasRecoveryPhone: boolean,
	hasTwoFactor: boolean
): SecurityLevel {
	const hasRecoveryMethod = hasRecoveryEmail || hasRecoveryPhone;

	if ( ! hasRecoveryMethod && ! hasTwoFactor ) {
		return 'none';
	}

	if ( hasRecoveryMethod && hasTwoFactor ) {
		return 'strong';
	}

	return 'partial';
}

/**
 * Account-recovery interstitial
 *
 * App-level overlay mounted in the dashboard shell. Shows a single modal to users with
 * incomplete account-recovery setup, nudging them to add a recovery method. Renders
 * nothing unless the feature flag is on and the user is eligible (or QA-forced).
 */
export default function AccountRecoveryInterstitial() {
	const router = useRouter();
	const { recordTracksEvent } = useAnalytics();
	const titleId = useId();

	const { data: accountRecovery, isSuccess: isAccountRecoveryLoaded } = useQuery(
		accountRecoveryQuery()
	);
	const { data: userSettings, isSuccess: isUserSettingsLoaded } = useQuery( userSettingsQuery() );
	const { data: snoozeUntilPersisted, isSuccess: isSnoozeLoaded } = useQuery(
		userPreferenceQuery( 'account-recovery-interstitial-snoozed-until' )
	);

	const snoozeMutation = useMutation(
		userPreferenceMutation( 'account-recovery-interstitial-snoozed-until' )
	);

	const [ isDismissed, setIsDismissed ] = useState( false );

	const now = Math.floor( Date.now() / 1000 );

	// When a QA scenario is forced, simulate its setup state; otherwise read the real account.
	const qaScenario = getQaScenario();
	const hasRecoveryEmail = qaScenario
		? qaScenario.hasRecoveryEmail
		: !! accountRecovery?.email_validated;
	const hasRecoveryPhone = qaScenario
		? qaScenario.hasRecoveryPhone
		: !! accountRecovery?.phone_validated;
	const hasTwoFactor = qaScenario ? qaScenario.hasTwoFactor : !! userSettings?.two_step_enabled;
	const hasBackupCodes = qaScenario
		? qaScenario.hasBackupCodes
		: !! userSettings?.two_step_backup_codes_printed;

	const securityLevel = getSecurityLevel( hasRecoveryEmail, hasRecoveryPhone, hasTwoFactor );
	const snoozeDays = SNOOZE_DAYS[ securityLevel ];

	// Ignore any real snooze when simulating a QA scenario, so the modal always shows.
	const snoozeUntil = qaScenario ? undefined : snoozeUntilPersisted;
	const isSnoozed = !! snoozeUntil && now < snoozeUntil;

	// Every user is nudged once their snooze (if any) has elapsed and the data has loaded:
	// `none`/`partial` setups are prompted to add a method, while fully-covered (`strong`) users
	// get a yearly periodic re-check via the 365-day snooze window (SNOOZE_DAYS.strong).
	const isEligible =
		isAccountRecoveryLoaded && isUserSettingsLoaded && isSnoozeLoaded && ! isSnoozed;

	// Gate the interstitial behind an A/B experiment. Mark the user eligible only once they would
	// otherwise qualify, so the exposure event fires for the right population and the control vs.
	// treatment split isn't diluted by users who would never see the modal.
	const [ isLoadingExperimentAssignment, experimentAssignment ] = useExperiment( EXPERIMENT_NAME, {
		isEligible,
	} );
	const isInExperimentTreatment =
		! isLoadingExperimentAssignment && experimentAssignment?.variationName === 'treatment';

	const hasRecoveryMethod = hasRecoveryEmail || hasRecoveryPhone;
	// Fine-grained setup state (5-way), recorded on Tracks as `recovery_status` alongside the
	// coarse 3-tier `security_level`. Also selects the copy variant.
	const variant = getInterstitialVariant( hasRecoveryMethod, hasTwoFactor, hasBackupCodes );

	// Shared Tracks properties for every interstitial event. The coarse `security_level` and 5-way
	// `recovery_status` summarize the setup; the `has_*` booleans expose exactly which methods are
	// in place for a finer-grained breakdown.
	const tracksProperties = {
		security_level: securityLevel,
		recovery_status: variant,
		has_recovery_email: hasRecoveryEmail,
		has_recovery_phone: hasRecoveryPhone,
		has_two_factor: hasTwoFactor,
		has_backup_codes: hasBackupCodes,
	};

	// QA overrides bypass the experiment entirely; real users only see the modal when eligible
	// and assigned to the treatment variation.
	const shouldDisplay =
		! isDismissed && ( isQaForced() || ( isEligible && isInExperimentTreatment ) );

	if ( ! shouldDisplay ) {
		return null;
	}

	const copy = getInterstitialCopy(
		qaScenario
			? {
					// Sample details so the personalized `strong` copy renders under QA.
					recoveryEmail: qaScenario.hasRecoveryEmail ? 'qa@example.com' : undefined,
					recoveryPhoneNumber: qaScenario.hasRecoveryPhone ? '5551234542' : undefined,
			  }
			: {
					recoveryEmail: accountRecovery?.email_validated ? accountRecovery.email : undefined,
					recoveryPhoneNumber: accountRecovery?.phone_validated
						? accountRecovery.phone?.number
						: undefined,
			  }
	)[ variant ];
	const { primaryCta, secondaryCta } = copy;

	const snooze = () => {
		snoozeMutation.mutate( now + snoozeDays * DAY_IN_SECONDS );
		setIsDismissed( true );
	};

	const handleSnooze = () => {
		recordTracksEvent( 'account_recovery_nudge_interstitial_dismiss', tracksProperties );
		snooze();
	};

	const handleCtaClick = ( cta: InterstitialCta ) => {
		recordTracksEvent( 'account_recovery_nudge_interstitial_cta_click', {
			...tracksProperties,
			cta_id: cta.id,
		} );
		// Snooze for this security level's window in all cases, so the user isn't re-prompted
		// on their next page load — whether they head off to set up a recovery method or positively
		// confirm ("Yes, all good"). Eligibility gates only on the snooze, so completing setup
		// alone wouldn't suppress the modal.
		snooze();
		if ( cta.route ) {
			router.navigate( { to: cta.route } );
		}
	};

	const remindLabel = sprintf(
		// translators: %d is the number of days until the reminder reappears.
		_n( 'Remind me in %d day', 'Remind me in %d days', snoozeDays ),
		snoozeDays
	);

	return (
		<Modal
			size="small"
			__experimentalHideHeader
			isDismissible={ false }
			focusOnMount="firstContentElement"
			aria={ { labelledby: titleId } }
			// Force an explicit choice: ESC and overlay clicks don't dismiss; the modal
			// only closes via its buttons. onRequestClose is still required by the type.
			shouldCloseOnEsc={ false }
			shouldCloseOnClickOutside={ false }
			onRequestClose={ handleSnooze }
			className="account-recovery-interstitial"
		>
			<ComponentViewTracker
				eventName="account_recovery_nudge_interstitial_impression"
				properties={ tracksProperties }
			/>
			<img className="account-recovery-interstitial__hero" src={ heroIllustration } alt="" />
			<VStack className="account-recovery-interstitial__body" spacing={ 6 }>
				<VStack spacing={ 2 }>
					<Text id={ titleId } as="h1" size={ 20 } weight={ 500 }>
						{ copy.title }
					</Text>
					<Text>{ copy.description }</Text>
				</VStack>
				<VStack className="account-recovery-interstitial__actions" spacing={ 2 }>
					<Button
						__next40pxDefaultSize
						variant="primary"
						onClick={ () => handleCtaClick( primaryCta ) }
					>
						{ primaryCta.label }
					</Button>
					{ secondaryCta && (
						<Button
							__next40pxDefaultSize
							variant="secondary"
							onClick={ () => handleCtaClick( secondaryCta ) }
						>
							{ secondaryCta.label }
						</Button>
					) }
					<Button __next40pxDefaultSize variant="tertiary" onClick={ handleSnooze }>
						{ remindLabel }
					</Button>
				</VStack>
			</VStack>
		</Modal>
	);
}
