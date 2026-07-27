import { userLastDraftQuery } from '@automattic/api-queries';
import ResurrectedWelcomeModal, {
	WELCOME_BACK_VARIATIONS,
	type ResurrectedWelcomeModalCta,
} from '@automattic/components/src/resurrected-welcome-modal';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { wpcomLink } from '../../utils/link';
import { useAnalytics } from '../analytics';
import { useAuth } from '../auth';
import {
	RESURRECTED_EVENT_3M,
	RESURRECTED_EVENT_6M,
	RESURRECTION_DAY_LIMIT_3M,
	RESURRECTION_DAY_LIMIT_EXPERIMENT,
} from './constants';
import { useResurrectedFreeUserEligibility } from './use-resurrected-free-user-eligibility';

const SESSION_STORAGE_KEY = 'wpcom_resurrected_welcome_modal_dismissed';

function getInitialDismissState() {
	if ( typeof window === 'undefined' ) {
		return false;
	}

	return window.sessionStorage.getItem( SESSION_STORAGE_KEY ) === 'true';
}

interface Props {
	isSuppressed?: boolean;
	onEligibilityResolved?: ( willDisplay: boolean ) => void;
	onVisibilityChange?: ( isVisible: boolean ) => void;
}

export function ResurrectedWelcomeModalGate( {
	isSuppressed = false,
	onEligibilityResolved,
	onVisibilityChange,
}: Props ) {
	const { recordTracksEvent } = useAnalytics();
	const { user } = useAuth();
	const eligibility = useResurrectedFreeUserEligibility();
	const [ hasDismissedForSession, setHasDismissedForSession ] = useState( () =>
		eligibility.isForcedVariation ? false : getInitialDismissState()
	);
	const [ hasTrackedImpression, setHasTrackedImpression ] = useState( false );
	const hasTrackedResurrectionRef = useRef( false );
	const previousVisibilityRef = useRef( false );

	const variationName = eligibility.variationName;
	const isContentVariation =
		eligibility.isEligible && variationName === WELCOME_BACK_VARIATIONS.content;
	const lastDraftQuery = useQuery(
		userLastDraftQuery( user.ID, isContentVariation && ! hasDismissedForSession && ! isSuppressed )
	);
	const willDisplay =
		! eligibility.isLoading &&
		eligibility.isEligible &&
		! hasDismissedForSession &&
		!! variationName;
	const shouldDisplay = willDisplay && ! isSuppressed;

	useEffect( () => {
		if ( eligibility.isForcedVariation ) {
			setHasDismissedForSession( false );
		}
	}, [ eligibility.isForcedVariation ] );

	useEffect( () => {
		if (
			eligibility.isLoading ||
			eligibility.lastSeen === null ||
			hasTrackedResurrectionRef.current
		) {
			return;
		}

		hasTrackedResurrectionRef.current = true;

		if ( eligibility.isResurrectedSixMonths ) {
			recordTracksEvent( RESURRECTED_EVENT_6M, {
				last_seen: eligibility.lastSeen,
				day_limit: RESURRECTION_DAY_LIMIT_EXPERIMENT,
			} );
		}

		if ( eligibility.isResurrectedThreeMonths ) {
			recordTracksEvent( RESURRECTED_EVENT_3M, {
				last_seen: eligibility.lastSeen,
				day_limit: RESURRECTION_DAY_LIMIT_3M,
			} );
		}
	}, [
		eligibility.isLoading,
		eligibility.isResurrectedSixMonths,
		eligibility.isResurrectedThreeMonths,
		eligibility.lastSeen,
		recordTracksEvent,
	] );

	useEffect( () => {
		if ( ! eligibility.isLoading ) {
			onEligibilityResolved?.( willDisplay );
		}
	}, [ eligibility.isLoading, onEligibilityResolved, willDisplay ] );

	useEffect( () => {
		if ( previousVisibilityRef.current !== shouldDisplay ) {
			previousVisibilityRef.current = shouldDisplay;
			onVisibilityChange?.( shouldDisplay );
		}
	}, [ shouldDisplay, onVisibilityChange ] );

	useEffect( () => {
		if ( ! shouldDisplay || hasTrackedImpression || ! variationName ) {
			return;
		}

		recordTracksEvent( 'calypso_resurrected_welcome_modal_impression', {
			variation: variationName,
		} );
		setHasTrackedImpression( true );
	}, [ shouldDisplay, variationName, hasTrackedImpression, recordTracksEvent ] );

	const persistDismissal = useCallback(
		( source: 'cta' | 'close' = 'cta' ) => {
			setHasDismissedForSession( true );
			if ( typeof window !== 'undefined' && ! eligibility.isForcedVariation ) {
				window.sessionStorage.setItem( SESSION_STORAGE_KEY, 'true' );
			}
			if ( source === 'close' ) {
				recordTracksEvent( 'calypso_resurrected_welcome_modal_dismiss', {
					variation: variationName || 'unknown',
					source,
				} );
			}
		},
		[ eligibility.isForcedVariation, recordTracksEvent, variationName ]
	);

	const handleCta = useCallback(
		( cta: ResurrectedWelcomeModalCta ) => {
			if ( ! variationName ) {
				return;
			}

			recordTracksEvent( 'calypso_resurrected_welcome_modal_cta_click', {
				variation: variationName,
				cta_id: cta.id,
			} );

			if ( cta.isDismissOnly ) {
				persistDismissal( 'cta' );
			}
		},
		[ persistDismissal, recordTracksEvent, variationName ]
	);

	if ( ! shouldDisplay || ! variationName ) {
		return null;
	}

	return (
		<ResurrectedWelcomeModal
			variationName={ variationName }
			lastDraft={ lastDraftQuery.data }
			isLastDraftLoading={ isContentVariation && lastDraftQuery.isPending }
			resolveHref={ wpcomLink }
			onClose={ () => persistDismissal( 'close' ) }
			onCtaClick={ handleCta }
		/>
	);
}

export { useResurrectedFreeUserEligibility } from './use-resurrected-free-user-eligibility';
export type { EligibilityResult } from './use-resurrected-free-user-eligibility';
