import {
	twoStepAuthSecurityKeysQuery,
	userPreferenceQuery,
	userPreferenceMutation,
} from '@automattic/api-queries';
import { isSupportSession } from '@automattic/calypso-support-session';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import {
	Modal,
	Button,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Icon, key } from '@wordpress/icons';
import { useId, useRef, useState } from 'react';
import ComponentViewTracker from '../../components/component-view-tracker';
import { Text } from '../../components/text';
import { isSecurityKeyMisscoped } from '../../me/security-two-step-auth/utils';
import { isWelcomeModalEligible } from '../../utils/hosting-dashboard-enrollment';
import { isDashboardBackport } from '../../utils/is-dashboard-backport';
import { useAnalytics } from '../analytics';
import { useAuth } from '../auth';
import { securityTwoStepAuthRoute } from '../router/me';
import './style.scss';

const DAY_IN_SECONDS = 86400;

// How long to hide the interstitial after the user defers it. Short, because until the key is
// re-registered the user can't log in with it.
const SNOOZE_DAYS = 7;

/**
 * Security-key re-register interstitial
 *
 * App-level overlay mounted in the dashboard shell. Shown to users who still have a security key
 * scoped to the wrong relying party (registered before scoping was fixed), nudging them to register
 * a fresh one so they can keep signing in with it. Renders nothing unless the feature flag is on and
 * the user actually has a misscoped key.
 */
export default function SecurityKeyReregisterInterstitial() {
	const router = useRouter();
	const { recordTracksEvent } = useAnalytics();
	const { user } = useAuth();
	const titleId = useId();

	const { data: securityKeys, isSuccess: isSecurityKeysLoaded } = useQuery(
		twoStepAuthSecurityKeysQuery()
	);
	const { data: snoozeUntilPersisted, isSuccess: isSnoozeLoaded } = useQuery(
		userPreferenceQuery( 'security-key-reregister-interstitial-snoozed-until' )
	);
	const { data: dashboardOptIn, isSuccess: isDashboardOptInLoaded } = useQuery(
		userPreferenceQuery( 'hosting-dashboard-opt-in' )
	);
	const { data: welcomeModalDismissed, isSuccess: isWelcomeModalDismissedLoaded } = useQuery(
		userPreferenceQuery( 'hosting-dashboard-opt-in-welcome-modal-dismissed' )
	);

	const snoozeMutation = useMutation(
		userPreferenceMutation( 'security-key-reregister-interstitial-snoozed-until' )
	);

	const [ isDismissed, setIsDismissed ] = useState( false );

	const now = Math.floor( Date.now() / 1000 );

	const hasMisscopedKey = !! securityKeys?.registrations?.some( ( registration ) =>
		isSecurityKeyMisscoped( registration.rp_id )
	);

	const isSnoozed = !! snoozeUntilPersisted && now < snoozeUntilPersisted;

	// Suppress the interstitial while the dashboard welcome modal is still pending, so the two
	// full-page modals don't stack on the first dashboard load. The welcome-modal state is latched at
	// first load: once the user dismisses the welcome modal, this interstitial keeps waiting until
	// their next page load instead of popping up right behind it.
	const isWelcomeDataLoaded = isDashboardOptInLoaded && isWelcomeModalDismissedLoaded;
	const welcomeModalPendingAtLoadRef = useRef< boolean | undefined >( undefined );
	if ( welcomeModalPendingAtLoadRef.current === undefined && isWelcomeDataLoaded ) {
		welcomeModalPendingAtLoadRef.current =
			! isDashboardBackport() &&
			isWelcomeModalEligible( dashboardOptIn, user.ID ) &&
			! welcomeModalDismissed;
	}
	const isWelcomeModalPending = welcomeModalPendingAtLoadRef.current ?? true;

	const isEligible =
		isSecurityKeysLoaded &&
		isSnoozeLoaded &&
		isWelcomeDataLoaded &&
		! isWelcomeModalPending &&
		hasMisscopedKey &&
		! isSnoozed &&
		! isSupportSession();

	if ( isDismissed || ! isEligible ) {
		return null;
	}

	const snooze = () => {
		snoozeMutation.mutate( now + SNOOZE_DAYS * DAY_IN_SECONDS );
		setIsDismissed( true );
	};

	const handleSnooze = () => {
		recordTracksEvent( 'calypso_security_key_reregister_interstitial_dismiss', {
			snooze_period: SNOOZE_DAYS,
		} );
		snooze();
	};

	const handleRegister = () => {
		recordTracksEvent( 'calypso_security_key_reregister_interstitial_cta_click' );
		// Snooze so the user isn't re-prompted on their next page load while they head off to
		// register the new key.
		snooze();
		router.navigate( { to: securityTwoStepAuthRoute.fullPath } );
	};

	return (
		<Modal
			size="small"
			__experimentalHideHeader
			isDismissible={ false }
			focusOnMount="firstContentElement"
			aria={ { labelledby: titleId } }
			// Force an explicit choice: ESC and overlay clicks don't dismiss; the modal only closes
			// via its buttons. onRequestClose is still required by the type.
			shouldCloseOnEsc={ false }
			shouldCloseOnClickOutside={ false }
			onRequestClose={ handleSnooze }
			className="security-key-reregister-interstitial"
		>
			<ComponentViewTracker eventName="calypso_security_key_reregister_interstitial_impression" />
			<VStack className="security-key-reregister-interstitial__body" spacing={ 6 }>
				<HStack justify="flex-start">
					<div className="security-key-reregister-interstitial__icon">
						<Icon icon={ key } size={ 28 } />
					</div>
				</HStack>
				<VStack spacing={ 2 }>
					<Text id={ titleId } as="h1" size={ 20 } weight={ 500 }>
						{ __( 'Action needed: re-register your security key' ) }
					</Text>
					<Text>
						{ __(
							'Due to a small setup issue, some of your security keys were linked to the wrong WordPress.com domain. This isn’t a security concern — your account and data are safe.'
						) }
					</Text>
					<Text>
						{ __( 'To keep signing in with a security key, please register a new one.' ) }
					</Text>
				</VStack>
				<VStack className="security-key-reregister-interstitial__actions" spacing={ 2 }>
					<Button __next40pxDefaultSize variant="primary" onClick={ handleRegister }>
						{ __( 'Register a new security key' ) }
					</Button>
					<Button __next40pxDefaultSize variant="tertiary" onClick={ handleSnooze }>
						{ __( 'Remind me later' ) }
					</Button>
				</VStack>
			</VStack>
		</Modal>
	);
}
