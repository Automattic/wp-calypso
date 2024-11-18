import { useBreakpoint } from '@automattic/viewport-react';
import { Button } from '@wordpress/components';
import { clsx } from 'clsx';
import { useEffect, useRef, useState } from 'react';
import A4AThemedModal from 'calypso/a8c-for-agencies/components/a4a-themed-modal';
import { A4A_AGENCY_TIER_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { AGENCY_FIRST_PURCHASE_SESSION_STORAGE_KEY } from 'calypso/a8c-for-agencies/constants';
import { preventWidows } from 'calypso/lib/formatting';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';
import type { AgencyTierInfo } from 'calypso/a8c-for-agencies/sections/agency-tier/types';

// Style is imported from the parent component

// Make sure to update the CSS values if you change the block padding or image height
const BLOCK_PADDING = 98; // 48px * 2
const IMAGE_HEIGHT = 260;
const MARGIN_BLOCK_END = 20;
const DEFAULT_MAX_HEIGHT = 300;

const PREFERENCE_NAME = 'a4a-agency-tier-celebration-modal-dismissed-type';

export default function AgencyTierCelebrationModal( {
	agencyTierInfo,
	currentAgencyTier,
}: {
	agencyTierInfo?: AgencyTierInfo | null;
	currentAgencyTier?: string | null;
} ) {
	const dispatch = useDispatch();
	const isNarrowView = useBreakpoint( '<660px' );

	const celebrationModalShowForCurrentType = useSelector( ( state ) =>
		getPreference( state, PREFERENCE_NAME )
	);

	const benefitslistRef = useRef< HTMLDivElement >( null );
	const [ isOverflowing, setIsOverflowing ] = useState( false );

	useEffect( () => {
		const currentRef = benefitslistRef?.current;

		const checkVerticalOverflow = () => {
			if ( currentRef ) {
				const { scrollTop, scrollHeight } = currentRef;

				const modalHeight =
					document.querySelector( '.agency-tier-celebration-modal' )?.clientHeight ?? 0;

				const maxHeight = isNarrowView
					? modalHeight - ( IMAGE_HEIGHT + BLOCK_PADDING + MARGIN_BLOCK_END )
					: DEFAULT_MAX_HEIGHT;

				currentRef.style.maxHeight = `${ maxHeight }px`;
				currentRef.style.marginBlockEnd = `${ MARGIN_BLOCK_END }px`;

				// Determine if the user is at the bottom of the list (allow some leeway with a small threshold)
				if ( scrollHeight > maxHeight && scrollTop < scrollHeight - maxHeight - 1 ) {
					setIsOverflowing( true );
				} else {
					setIsOverflowing( false );
				}
			}
		};

		checkVerticalOverflow(); // Initial check on component mount

		currentRef?.addEventListener( 'scroll', checkVerticalOverflow );

		return () => {
			currentRef?.removeEventListener( 'scroll', checkVerticalOverflow );
		};
	}, [ isNarrowView ] );

	// Record the event when the modal is shown
	useEffect( () => {
		if (
			agencyTierInfo?.celebrationModal &&
			celebrationModalShowForCurrentType !== currentAgencyTier
		) {
			dispatch(
				recordTracksEvent( 'calypso_a8c_agency_tier_celebration_modal_shown', {
					agency_tier: currentAgencyTier,
				} )
			);
		}
	}, [ agencyTierInfo, celebrationModalShowForCurrentType, currentAgencyTier, dispatch ] );

	const isAgencyFirstPurchase = sessionStorage.getItem( AGENCY_FIRST_PURCHASE_SESSION_STORAGE_KEY );

	if (
		! agencyTierInfo?.celebrationModal ||
		celebrationModalShowForCurrentType === currentAgencyTier ||
		// Don't show the modal if the user is already on the emerging-partner tier and it's not their first purchase
		( currentAgencyTier === 'emerging-partner' && ! isAgencyFirstPurchase )
	) {
		return null;
	}

	const handleSavePreference = () => {
		// Save the preference to prevent the modal from showing again
		dispatch( savePreference( PREFERENCE_NAME, currentAgencyTier ?? '' ) );
		sessionStorage.removeItem( AGENCY_FIRST_PURCHASE_SESSION_STORAGE_KEY );
	};

	const handleOnClose = () => {
		handleSavePreference();
		dispatch(
			recordTracksEvent( 'calypso_a8c_agency_tier_celebration_modal_dismiss', {
				agency_tier: currentAgencyTier,
			} )
		);
	};

	const handleClickExploreBenefits = () => {
		handleSavePreference();
		dispatch(
			recordTracksEvent( 'calypso_a8c_agency_tier_celebration_modal_explore_benefits_click', {
				agency_tier: currentAgencyTier,
			} )
		);
	};

	const { title, description, extraDescription, benefits, video, image, cta } =
		agencyTierInfo.celebrationModal;

	return (
		<A4AThemedModal
			className={ clsx( 'agency-tier-celebration-modal', currentAgencyTier, {
				'is-narrow-view': isNarrowView,
			} ) }
			modalVideo={
				! isNarrowView ? (
					<video src={ video } preload="auto" width={ 470 } loop muted autoPlay />
				) : undefined
			}
			modalImage={ isNarrowView ? image : undefined }
			onClose={ handleOnClose }
			dismissable
		>
			<div className="agency-tier-celebration-modal__content-wrapper">
				<div className="agency-tier-celebration-modal__content" ref={ benefitslistRef }>
					<div className="agency-tier-celebration-modal__title">{ preventWidows( title ) }</div>
					<div className="agency-tier-celebration-modal__description">
						{ preventWidows( description ) }
					</div>
					{ extraDescription && (
						<div className="agency-tier-celebration-modal__extra-description">
							{ preventWidows( extraDescription ) }
						</div>
					) }
					{ benefits && (
						<ul className="agency-tier-celebration-modal__benefits">
							{ benefits.map( ( benefit ) => (
								<li key={ benefit }>{ preventWidows( benefit ) }</li>
							) ) }
						</ul>
					) }
				</div>
				<div
					className={ clsx( 'agency-tier-celebration-modal__scroll-indicator', {
						'is-overflowing': isOverflowing,
					} ) }
				></div>
			</div>
			<div className="agency-tier-celebration-modal__footer">
				<Button
					variant="primary"
					onClick={ handleClickExploreBenefits }
					href={ A4A_AGENCY_TIER_LINK }
				>
					{ cta }
				</Button>
			</div>
		</A4AThemedModal>
	);
}
