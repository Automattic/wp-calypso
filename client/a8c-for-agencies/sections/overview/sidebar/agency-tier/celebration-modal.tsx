import { useBreakpoint } from '@automattic/viewport-react';
import { Button } from '@wordpress/components';
import { clsx } from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useRef, useState } from 'react';
import A4AThemedModal from 'calypso/a8c-for-agencies/components/a4a-themed-modal';
import { A4A_AGENCY_TIER_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { useDispatch, useSelector } from 'calypso/state';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';
import type { AgencyTierInfo } from 'calypso/a8c-for-agencies/sections/agency-tier/types';

// Style is imported from the parent component

const PREFERENCE_NAME = 'a4a-agency-tier-celebration-modal-dismissed-type';

export default function AgencyTierCelebrationModal( {
	agencyTierInfo,
	currentAgencyTier,
}: {
	agencyTierInfo?: AgencyTierInfo | null;
	currentAgencyTier?: string | null;
} ) {
	const dispatch = useDispatch();
	const translate = useTranslate();
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
				const { scrollTop, scrollHeight, clientHeight } = currentRef;
				// Determine if the user is at the bottom of the list (allow some leeway with a small threshold)
				if ( scrollHeight > clientHeight && scrollTop < scrollHeight - clientHeight - 1 ) {
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
	}, [] );

	if ( ! agencyTierInfo || celebrationModalShowForCurrentType === currentAgencyTier ) {
		return null;
	}

	const handleOnClose = () => {
		dispatch( savePreference( PREFERENCE_NAME, currentAgencyTier ?? '' ) );
	};

	const { title, description, extraDescription, benefits, video, image } =
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
					<div className="agency-tier-celebration-modal__title">{ title }</div>
					<div className="agency-tier-celebration-modal__description">{ description }</div>
					{ extraDescription && (
						<div className="agency-tier-celebration-modal__extra-description">
							{ extraDescription }
						</div>
					) }
					<ul className="agency-tier-celebration-modal__benefits">
						{ benefits.map( ( benefit ) => (
							<li key={ benefit }>{ benefit }</li>
						) ) }
					</ul>
				</div>
				<div
					className={ clsx( 'agency-tier-celebration-modal__scroll-indicator', {
						'is-overflowing': isOverflowing,
					} ) }
				></div>
			</div>
			<div className="agency-tier-celebration-modal__footer">
				<Button variant="primary" onClick={ handleOnClose } href={ A4A_AGENCY_TIER_LINK }>
					{ translate( 'Explore your benefits' ) }
				</Button>
			</div>
		</A4AThemedModal>
	);
}
