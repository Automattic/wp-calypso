import {
	accountRecoveryQuery,
	userSettingsQuery,
	userSettingsMutation,
} from '@automattic/api-queries';
import { isEnabled } from '@automattic/calypso-config';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { Modal, Button, __experimentalVStack as VStack } from '@wordpress/components';
import { _n, sprintf } from '@wordpress/i18n';
import { useEffect, useId, useRef, useState } from 'react';
import { Text } from '../../components/text';
import { useAnalytics } from '../analytics';
import { computeEligibility } from './compute-eligibility';
import {
	RECOVERY_INTERSTITIAL_FLAG,
	RECOVERY_INTERSTITIAL_QA_PARAM,
	RECOVERY_INTERSTITIAL_SNOOZE_META,
	RECOVERY_INTERSTITIAL_TRACKS,
} from './constants';
import { getInterstitialCopy, getInterstitialVariant } from './copy';
import heroIllustration from './hero-illustration.png';
import type { InterstitialCta } from './copy';
import type { UserSettings } from '@automattic/api-core';
import './style.scss';

const DAY_IN_SECONDS = 86400;

function isQaForced() {
	if ( typeof window === 'undefined' ) {
		return false;
	}
	return (
		new URLSearchParams( window.location.search ).get( RECOVERY_INTERSTITIAL_QA_PARAM ) === 'force'
	);
}

/**
 * Account-recovery interstitial
 *
 * App-level overlay mounted in the dashboard shell. Shows a single modal to users with
 * incomplete account-recovery setup, nudging them to add a recovery method. Renders
 * nothing unless the feature flag is on and the user is eligible (or QA-forced).
 */
export default function AccountRecoveryInterstitial() {
	const isFeatureEnabled = isEnabled( RECOVERY_INTERSTITIAL_FLAG );
	const router = useRouter();
	const { recordTracksEvent } = useAnalytics();
	const titleId = useId();

	const { data: accountRecovery, isSuccess: isAccountRecoveryLoaded } = useQuery( {
		...accountRecoveryQuery(),
		enabled: isFeatureEnabled,
	} );
	const { data: userSettings, isSuccess: isUserSettingsLoaded } = useQuery( {
		...userSettingsQuery(),
		enabled: isFeatureEnabled,
	} );

	const snoozeMutation = useMutation( userSettingsMutation() );

	const [ isDismissed, setIsDismissed ] = useState( false );
	const hasRecordedImpression = useRef( false );

	const now = Math.floor( Date.now() / 1000 );
	const { isEligible, securityLevel, snoozeDays } = computeEligibility( {
		isLoaded: isAccountRecoveryLoaded && isUserSettingsLoaded,
		hasRecoveryEmail: !! accountRecovery?.email_validated,
		hasRecoveryPhone: !! accountRecovery?.phone_validated,
		hasTwoFactor: !! userSettings?.two_step_enabled,
		snoozeUntil: userSettings?.[ RECOVERY_INTERSTITIAL_SNOOZE_META ],
		now,
	} );

	const hasRecoveryMethod =
		!! accountRecovery?.email_validated || !! accountRecovery?.phone_validated;
	// Fine-grained setup state (5-way), recorded on Tracks as `recovery_status` alongside the
	// coarse 3-tier `security_level`. Also selects the copy variant.
	const variant = getInterstitialVariant(
		hasRecoveryMethod,
		!! userSettings?.two_step_enabled,
		!! userSettings?.two_step_backup_codes_printed
	);

	const shouldDisplay = isFeatureEnabled && ! isDismissed && ( isQaForced() || isEligible );

	useEffect( () => {
		if ( shouldDisplay && ! hasRecordedImpression.current ) {
			hasRecordedImpression.current = true;
			recordTracksEvent( RECOVERY_INTERSTITIAL_TRACKS.impression, {
				security_level: securityLevel,
				recovery_status: variant,
			} );
		}
	}, [ shouldDisplay, securityLevel, variant, recordTracksEvent ] );

	if ( ! shouldDisplay ) {
		return null;
	}

	const copy = getInterstitialCopy( {
		recoveryEmail: accountRecovery?.email_validated ? accountRecovery.email : undefined,
		recoveryPhoneNumber: accountRecovery?.phone_validated
			? accountRecovery.phone?.number
			: undefined,
	} )[ variant ];
	const { primaryCta, secondaryCta } = copy;

	const snooze = () => {
		const snoozeUntil = now + snoozeDays * DAY_IN_SECONDS;
		snoozeMutation.mutate( { [ RECOVERY_INTERSTITIAL_SNOOZE_META ]: snoozeUntil } );
		setIsDismissed( true );
	};

	const handleSnooze = () => {
		recordTracksEvent( RECOVERY_INTERSTITIAL_TRACKS.dismiss, {
			security_level: securityLevel,
			recovery_status: variant,
		} );
		snooze();
	};

	const handleCtaClick = ( cta: InterstitialCta ) => {
		recordTracksEvent( RECOVERY_INTERSTITIAL_TRACKS.ctaClick, {
			security_level: securityLevel,
			recovery_status: variant,
			cta_id: cta.id,
		} );
		if ( cta.route ) {
			setIsDismissed( true );
			router.navigate( { to: cta.route } );
			return;
		}
		// No route → a positive confirmation ("Yes, all good"); snooze for this level's window.
		snooze();
	};

	const remindLabel = sprintf(
		// translators: %d is the number of days until the reminder reappears.
		_n( 'Remind me in %d day', 'Remind me in %d days', snoozeDays ),
		snoozeDays
	);

	return (
		<Modal
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
			<img className="account-recovery-interstitial__hero" src={ heroIllustration } alt="" />
			<VStack className="account-recovery-interstitial__body" spacing={ 6 }>
				<VStack spacing={ 2 }>
					<Text id={ titleId } as="h1" size={ 20 } weight={ 500 }>
						{ copy.title }
					</Text>
					<Text variant="muted">{ copy.description }</Text>
				</VStack>
				<VStack className="account-recovery-interstitial__actions" spacing={ 3 }>
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
