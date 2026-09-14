import { recordTracksEvent } from '@automattic/calypso-analytics';
import ResurrectedWelcomeModal, {
	type ResurrectedWelcomeModalCta,
} from '@automattic/components/src/resurrected-welcome-modal';
import { useCallback, useEffect, useRef, useState } from '@wordpress/element';
import useLastDraftQuery from 'calypso/data/posts/use-last-draft-query';
import { useResurrectedFreeUserEligibility } from 'calypso/lib/resurrected-users';
import { WELCOME_BACK_VARIATIONS } from 'calypso/lib/resurrected-users/constants';

const SESSION_STORAGE_KEY = 'wpcom_resurrected_welcome_modal_dismissed';

const getInitialDismissState = () => {
	if ( typeof window === 'undefined' ) {
		return false;
	}

	return window.sessionStorage.getItem( SESSION_STORAGE_KEY ) === 'true';
};

type Props = {
	isSuppressed?: boolean;
	onVisibilityChange?: ( isVisible: boolean ) => void;
};

export const ResurrectedWelcomeModalGate = ( {
	isSuppressed = false,
	onVisibilityChange,
}: Props ) => {
	const eligibility = useResurrectedFreeUserEligibility();
	const [ hasDismissedForSession, setHasDismissedForSession ] = useState( () =>
		eligibility.isForcedVariation ? false : getInitialDismissState()
	);
	const [ hasTrackedImpression, setHasTrackedImpression ] = useState( false );
	const previousVisibilityRef = useRef( false );

	const variationName = eligibility.variationName;
	const isContentVariation =
		eligibility.isEligible && variationName === WELCOME_BACK_VARIATIONS.content;
	const lastDraftQuery = useLastDraftQuery( {
		enabled: isContentVariation && ! hasDismissedForSession,
	} );
	const shouldDisplay =
		! eligibility.isLoading &&
		eligibility.isEligible &&
		! hasDismissedForSession &&
		! isSuppressed &&
		!! variationName;

	useEffect( () => {
		if ( eligibility.isForcedVariation ) {
			setHasDismissedForSession( false );
		}
	}, [ eligibility.isForcedVariation ] );

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
	}, [ shouldDisplay, variationName, hasTrackedImpression ] );

	const persistDismissal = useCallback(
		( source: 'cta' | 'close' = 'cta' ) => {
			setHasDismissedForSession( true );
			if ( typeof window !== 'undefined' && ! eligibility.isForcedVariation ) {
				window.sessionStorage.setItem( SESSION_STORAGE_KEY, 'true' );
			}
			if ( source === 'close' ) {
				recordTracksEvent( 'calypso_resurrected_welcome_modal_dismiss', {
					variation: variationName ?? 'unknown',
					source,
				} );
			}
		},
		[ variationName, eligibility.isForcedVariation ]
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

			persistDismissal( 'cta' );
		},
		[ variationName, persistDismissal ]
	);

	if ( ! shouldDisplay || ! variationName ) {
		return null;
	}

	return (
		<ResurrectedWelcomeModal
			variationName={ variationName }
			lastDraft={ lastDraftQuery.data }
			isLastDraftLoading={ isContentVariation && lastDraftQuery.isPending }
			onClose={ () => persistDismissal( 'close' ) }
			onCtaClick={ handleCta }
		/>
	);
};

export default ResurrectedWelcomeModalGate;
