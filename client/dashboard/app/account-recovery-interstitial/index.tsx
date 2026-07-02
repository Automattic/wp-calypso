import {
	accountRecoveryQuery,
	userSettingsQuery,
	userPreferenceQuery,
	userPreferenceMutation,
} from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { Modal, Button, __experimentalVStack as VStack } from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import { useId, useState } from 'react';
import ComponentViewTracker from '../../components/component-view-tracker';
import { Text } from '../../components/text';
import { useAnalytics } from '../analytics';
import { getInterstitialCopy, getInterstitialVariant } from './copy';
import heroIllustration from './hero-illustration.png';
import type { InterstitialCta } from './copy';
import './style.scss';

const DAY_IN_SECONDS = 86400;

/**
 * How secure the user's account already is. Single source of truth for the tiers;
 * SNOOZE_DAYS and the copy map are both keyed by it.
 */
type SecurityLevel = 'none' | 'partial' | 'strong';

/**
 * Snooze windows (in days) by security level
 */
const SNOOZE_DAYS: Record< SecurityLevel, number > = {
	none: 14, // no recovery method or 2FA set up
	partial: 30, // a recovery method but no 2FA or vice-versa
	strong: 365, // recovery method and 2FA in place (the only nudge left is backup codes)
};

/** Maps the user's account-recovery setup to a SecurityLevel. */
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
 * nothing unless the feature flag is on and the user is eligible (not snoozed).
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

	const hasRecoveryEmail = !! accountRecovery?.email_validated;
	const hasRecoveryPhone = !! accountRecovery?.phone_validated;
	const hasTwoFactor = !! userSettings?.two_step_enabled;
	const hasBackupCodes = !! userSettings?.two_step_backup_codes_printed;
	const hasRecoveryMethod = hasRecoveryEmail || hasRecoveryPhone;

	const securityLevel = getSecurityLevel( hasRecoveryEmail, hasRecoveryPhone, hasTwoFactor );
	const snoozeDays = SNOOZE_DAYS[ securityLevel ];

	const isSnoozed = !! snoozeUntilPersisted && now < snoozeUntilPersisted;

	// Selects the copy variant depending on the user's account recovery settings.
	const variant = getInterstitialVariant( hasRecoveryMethod, hasTwoFactor, hasBackupCodes );

	// Eligible once the data has loaded and the snooze (if any) has elapsed.
	const isEligible =
		isAccountRecoveryLoaded && isUserSettingsLoaded && isSnoozeLoaded && ! isSnoozed;

	// Fully-secured users (variant === 'strong') are left alone — we only nudge people who are still
	// missing a recovery method, 2FA, or backup codes.
	if ( isDismissed || ! isEligible || variant === 'strong' ) {
		return null;
	}

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

	const copy = getInterstitialCopy( {
		recoveryEmail: accountRecovery?.email_validated ? accountRecovery.email : undefined,
		recoveryPhoneNumber: accountRecovery?.phone_validated
			? accountRecovery.phone?.number
			: undefined,
	} )[ variant ];
	const { primaryCta, secondaryCta } = copy;

	const snooze = () => {
		snoozeMutation.mutate( now + snoozeDays * DAY_IN_SECONDS );
		setIsDismissed( true );
	};

	const handleSnooze = () => {
		recordTracksEvent( 'calypso_account_recovery_nudge_interstitial_dismiss', tracksProperties );
		snooze();
	};

	const handleCtaClick = ( cta: InterstitialCta ) => {
		recordTracksEvent( 'calypso_account_recovery_nudge_interstitial_cta_click', {
			...tracksProperties,
			cta_id: cta.id,
		} );
		// Snooze for this security level's window so the user isn't re-prompted on their next
		// page load while they head off to set up the missing recovery method.
		snooze();
		if ( cta.route ) {
			router.navigate( { to: cta.route } );
		}
	};

	// Users who already have a recovery method and 2FA in place get a year-long snooze, so a
	// "remind me in 365 days" nudge would read as a permanent dismissal — label it as such.
	const remindLabel =
		securityLevel === 'strong'
			? __( 'Dismiss' )
			: sprintf(
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
				eventName="calypso_account_recovery_nudge_interstitial_impression"
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
