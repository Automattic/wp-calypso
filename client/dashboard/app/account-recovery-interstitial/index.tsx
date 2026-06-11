import {
	accountRecoveryQuery,
	userSettingsQuery,
	userSettingsMutation,
} from '@automattic/api-queries';
import { isEnabled } from '@automattic/calypso-config';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { Modal, Button, __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect, useRef, useState } from 'react';
import { ButtonStack } from '../../components/button-stack';
import { Text } from '../../components/text';
import { useAnalytics } from '../analytics';
import { computeEligibility } from './compute-eligibility';
import {
	RECOVERY_INTERSTITIAL_CTA_ROUTE,
	RECOVERY_INTERSTITIAL_FLAG,
	RECOVERY_INTERSTITIAL_QA_PARAM,
	RECOVERY_INTERSTITIAL_SNOOZE_META,
	RECOVERY_INTERSTITIAL_TRACKS,
} from './constants';
import { getInterstitialCopy } from './copy';

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
 * Account-recovery interstitial (Phase 1).
 *
 * App-level overlay mounted in the dashboard shell. Shows a single modal to users with
 * incomplete account-recovery setup, nudging them to add a recovery method. Renders
 * nothing unless the feature flag is on and the user is eligible (or QA-forced).
 */
export default function AccountRecoveryInterstitial() {
	const isFeatureEnabled = isEnabled( RECOVERY_INTERSTITIAL_FLAG );
	const router = useRouter();
	const { recordTracksEvent } = useAnalytics();

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

	const shouldDisplay = isFeatureEnabled && ! isDismissed && ( isQaForced() || isEligible );

	useEffect( () => {
		if ( shouldDisplay && ! hasRecordedImpression.current ) {
			hasRecordedImpression.current = true;
			recordTracksEvent( RECOVERY_INTERSTITIAL_TRACKS.impression, {
				security_level: securityLevel,
			} );
		}
	}, [ shouldDisplay, securityLevel, recordTracksEvent ] );

	if ( ! shouldDisplay ) {
		return null;
	}

	const copy = getInterstitialCopy()[ securityLevel ];

	const handleDismiss = () => {
		recordTracksEvent( RECOVERY_INTERSTITIAL_TRACKS.dismiss, { security_level: securityLevel } );
		snoozeMutation.mutate( {
			[ RECOVERY_INTERSTITIAL_SNOOZE_META ]: now + snoozeDays * DAY_IN_SECONDS,
		} );
		setIsDismissed( true );
	};

	const handleAddRecoveryMethod = () => {
		recordTracksEvent( RECOVERY_INTERSTITIAL_TRACKS.ctaClick, {
			security_level: securityLevel,
			cta_id: 'add_recovery_method',
		} );
		setIsDismissed( true );
		router.navigate( { to: RECOVERY_INTERSTITIAL_CTA_ROUTE } );
	};

	return (
		<Modal
			title={ copy.title }
			size="medium"
			closeButtonLabel={ __( 'Close' ) }
			onRequestClose={ handleDismiss }
			className="account-recovery-interstitial"
		>
			<VStack spacing={ 8 }>
				<Text>{ copy.description }</Text>
				<ButtonStack justify="flex-end">
					<Button __next40pxDefaultSize variant="tertiary" onClick={ handleDismiss }>
						{ copy.dismissCta }
					</Button>
					<Button __next40pxDefaultSize variant="primary" onClick={ handleAddRecoveryMethod }>
						{ copy.primaryCta }
					</Button>
				</ButtonStack>
			</VStack>
		</Modal>
	);
}
