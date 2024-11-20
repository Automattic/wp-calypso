import { useBreakpoint } from '@automattic/viewport-react';
import { Button } from '@wordpress/components';
import { clsx } from 'clsx';
import { useEffect, useRef, useState } from 'react';
import A4AThemedModal from 'calypso/a8c-for-agencies/components/a4a-themed-modal';
import { A4A_AGENCY_TIER_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { preventWidows } from 'calypso/lib/formatting';
import type { AgencyTierCelebrationModal } from 'calypso/a8c-for-agencies/sections/agency-tier/types';

// Make sure to update the CSS values if you change the block padding or image height
const BLOCK_PADDING = 98; // 48px * 2
const IMAGE_HEIGHT = 260;
const MARGIN_BLOCK_END = 20;
const DEFAULT_MAX_HEIGHT = 300;

const AgencyTierCelebrationModalContent = ( {
	celebrationModal,
	currentAgencyTier,
	handleOnClose,
	handleClickExploreBenefits,
}: {
	celebrationModal: AgencyTierCelebrationModal;
	currentAgencyTier?: string | null;
	handleOnClose: () => void;
	handleClickExploreBenefits: () => void;
} ) => {
	const isNarrowView = useBreakpoint( '<660px' );

	const [ isOverflowing, setIsOverflowing ] = useState( false );

	const benefitslistRef = useRef< HTMLDivElement >( null );

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

	const { title, description, extraDescription, benefits, video, image, cta } = celebrationModal;

	const showImage = isNarrowView || ! video;

	return (
		<A4AThemedModal
			className={ clsx( 'agency-tier-celebration-modal', currentAgencyTier, {
				'is-narrow-view': isNarrowView,
			} ) }
			modalVideo={
				! showImage ? (
					<video src={ video } preload="auto" width={ 470 } loop muted autoPlay />
				) : undefined
			}
			modalImage={ showImage ? image : undefined }
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
};

export default AgencyTierCelebrationModalContent;
