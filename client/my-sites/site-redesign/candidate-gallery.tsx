import { formatNumber } from '@automattic/number-formatters';
import {
	Button,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOptionIcon as ToggleGroupControlOptionIcon,
} from '@wordpress/components';
import { useInstanceId, useViewportMatch } from '@wordpress/compose';
import { __, isRTL, sprintf } from '@wordpress/i18n';
import { chevronLeft, chevronRight, desktop, mobile } from '@wordpress/icons';
import { useCallback, useRef, useState } from 'react';
import { CandidatePreview, type PreviewState } from './candidate-preview';
import { GalleryStage } from './gallery-stage';
import { SiteSkeleton } from './site-skeleton';
import { useArrowBrowsing } from './use-arrow-browsing';
import type { Candidate } from './api';
import type { PreviewDevice } from './gallery-geometry';

import './gallery.scss';

function usePreviewDevice() {
	const isSmallViewport = useViewportMatch( 'small', '<' );
	const [ chosen, setChosen ] = useState< PreviewDevice | null >( null );
	return [ chosen ?? ( isSmallViewport ? 'mobile' : 'desktop' ), setChosen ] as const;
}

function DeviceToggle( {
	value,
	onChange,
}: {
	value: PreviewDevice;
	onChange: ( device: PreviewDevice ) => void;
} ) {
	return (
		<div className="site-redesign__device">
			<ToggleGroupControl
				label={ __( 'Preview as' ) }
				hideLabelFromVision
				value={ value }
				onChange={ ( next ) => onChange( next as PreviewDevice ) }
				__next40pxDefaultSize
				__nextHasNoMarginBottom
			>
				<ToggleGroupControlOptionIcon value="desktop" icon={ desktop } label={ __( 'Desktop' ) } />
				<ToggleGroupControlOptionIcon value="mobile" icon={ mobile } label={ __( 'Mobile' ) } />
			</ToggleGroupControl>
		</div>
	);
}

function candidateState( candidate: Candidate ): string {
	switch ( candidate.status ) {
		case 'succeeded':
			return __( 'Ready' );
		case 'failed':
			return __( 'Couldn’t be made' );
		default:
			return __( 'Still being made' );
	}
}

function readiness(
	candidate: Candidate,
	preview: PreviewState | undefined,
	sessionReady: boolean
): string {
	if ( candidate.status !== 'succeeded' ) {
		return candidateState( candidate );
	}
	if ( preview === 'error' ) {
		return __( 'The preview couldn’t load.' );
	}
	if ( preview !== 'ready' ) {
		return __( 'Loading the preview…' );
	}
	return sessionReady
		? __( 'Ready to choose' )
		: __( 'Ready. You can choose once every design is done.' );
}

function SlideContent( {
	siteId,
	redesignId,
	candidate,
	index,
	isActive,
	onPreviewStateChange,
}: {
	siteId: number;
	redesignId: string;
	candidate: Candidate;
	index: number;
	isActive: boolean;
	onPreviewStateChange: ( generationId: string, state: PreviewState ) => void;
} ) {
	if ( candidate.status === 'succeeded' ) {
		return (
			<CandidatePreview
				siteId={ siteId }
				redesignId={ redesignId }
				candidate={ candidate }
				index={ index }
				isActive={ isActive }
				onStateChange={ onPreviewStateChange }
			/>
		);
	}
	if ( candidate.status === 'failed' ) {
		return (
			<p className="site-redesign__slide-message">
				{ candidate.error?.message ?? __( 'This design could not be made.' ) }
			</p>
		);
	}
	return <SiteSkeleton className="site-redesign__skeleton" />;
}

// Holds the gallery's place while there are no designs to show yet.
export function GalleryPlaceholder() {
	const [ device ] = usePreviewDevice();
	return (
		<div className="site-redesign__gallery" aria-hidden="true">
			<GalleryStage
				device={ device }
				activeIndex={ 1 }
				slides={ Array.from( { length: 3 }, ( _, index ) => ( {
					key: String( index ),
					content: <SiteSkeleton className="site-redesign__skeleton" />,
				} ) ) }
				toolbar={
					<>
						<div className="site-redesign__action-skeleton is-device" />
						<div className="site-redesign__action-skeleton is-choose" />
					</>
				}
			/>
			<p className="site-redesign__position" />
		</div>
	);
}

export function CandidateGallery( {
	siteId,
	redesignId,
	candidates,
	sessionReady,
	isChoosing,
	onChoose,
}: {
	siteId: number;
	redesignId: string;
	candidates: Candidate[];
	/** Whether the session accepts a choice, as opposed to still making designs. */
	sessionReady: boolean;
	isChoosing: boolean;
	onChoose: ( generationId: string ) => void;
} ) {
	const [ activeId, setActiveId ] = useState< string | null >( null );
	const [ previews, setPreviews ] = useState< Record< string, PreviewState > >( {} );
	const [ device, setDevice ] = usePreviewDevice();
	const positionId = `site-redesign-position-${ useInstanceId( CandidateGallery ) }`;

	// The shown design is held by its ID, so it stays put while the others finish or move. A
	// design that is gone hands over to the first one, and that one is then held the same way.
	const found = candidates.findIndex( ( candidate ) => candidate.id === activeId );
	const activeIndex = Math.max( 0, found );
	const active = candidates[ activeIndex ];
	if ( active.id !== activeId ) {
		setActiveId( active.id );
	}
	const select = ( index: number ) => setActiveId( candidates[ index ].id );
	const hasChoice = candidates.length > 1;
	const gallery = useRef< HTMLElement >( null );
	useArrowBrowsing( gallery, ( step ) => {
		const next = activeIndex + step;
		if ( next >= 0 && next < candidates.length ) {
			select( next );
		}
	} );
	const activePreview = active.status === 'succeeded' ? previews[ active.id ] : undefined;

	const onPreviewStateChange = useCallback( ( generationId: string, state: PreviewState ) => {
		setPreviews( ( current ) =>
			current[ generationId ] === state ? current : { ...current, [ generationId ]: state }
		);
	}, [] );

	return (
		<section
			ref={ gallery }
			className="site-redesign__gallery"
			aria-roledescription={ __( 'carousel' ) }
			aria-label={ __( 'Designs' ) }
		>
			<GalleryStage
				device={ device }
				activeIndex={ activeIndex }
				onSelect={ select }
				toolbar={
					<>
						<DeviceToggle value={ device } onChange={ setDevice } />
						<Button
							__next40pxDefaultSize
							className="site-redesign__choose"
							variant="primary"
							isBusy={ isChoosing }
							disabled={ ! sessionReady || isChoosing || activePreview !== 'ready' }
							accessibleWhenDisabled
							aria-describedby={ positionId }
							onClick={ () => onChoose( active.id ) }
						>
							{ __( 'Choose this one' ) }
						</Button>
					</>
				}
				slides={ candidates.map( ( candidate, index ) => ( {
					key: candidate.id,
					label: sprintf(
						/* translators: %1$s is the design's position, %2$s is how many designs there are. */
						__( 'Design %1$s of %2$s' ),
						formatNumber( index + 1 ),
						formatNumber( candidates.length )
					),
					showLabel: sprintf(
						/* translators: %s is the design's position in the list of designs. */
						__( 'Show design %s' ),
						formatNumber( index + 1 )
					),
					content: (
						<SlideContent
							siteId={ siteId }
							redesignId={ redesignId }
							candidate={ candidate }
							index={ index }
							isActive={ index === activeIndex }
							onPreviewStateChange={ onPreviewStateChange }
						/>
					),
				} ) ) }
			>
				{ hasChoice && (
					<>
						<Button
							__next40pxDefaultSize
							className="site-redesign__step is-previous"
							icon={ isRTL() ? chevronRight : chevronLeft }
							label={ __( 'Previous design' ) }
							showTooltip={ false }
							disabled={ activeIndex === 0 }
							accessibleWhenDisabled
							onClick={ () => select( activeIndex - 1 ) }
						/>
						<Button
							__next40pxDefaultSize
							className="site-redesign__step is-next"
							icon={ isRTL() ? chevronLeft : chevronRight }
							label={ __( 'Next design' ) }
							showTooltip={ false }
							disabled={ activeIndex === candidates.length - 1 }
							accessibleWhenDisabled
							onClick={ () => select( activeIndex + 1 ) }
						/>
					</>
				) }
			</GalleryStage>
			<p id={ positionId } className="site-redesign__position" aria-live="polite" aria-atomic>
				<span className="site-redesign__position-count">
					{ sprintf(
						/* translators: %1$s is the shown design's position, %2$s is how many designs there are. */
						__( 'Design %1$s of %2$s' ),
						formatNumber( activeIndex + 1 ),
						formatNumber( candidates.length )
					) }
				</span>
				<span className="site-redesign__position-state">
					{ readiness( active, activePreview, sessionReady ) }
				</span>
			</p>
		</section>
	);
}
