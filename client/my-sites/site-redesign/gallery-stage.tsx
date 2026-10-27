import { useResizeObserver } from '@wordpress/compose';
import { __, isRTL } from '@wordpress/i18n';
import clsx from 'clsx';
import { useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from 'react';
import {
	DEVICE_VIEWPORTS,
	fitSlide,
	placeSlide,
	type PreviewDevice,
	type Size,
} from './gallery-geometry';

const SWIPE_DISTANCE = 40;
// A swipe starts on a preview or a neighbor, never on a control. The neighbor's own click target
// is a button too, but it stands for the preview under it.
const NOT_SWIPEABLE =
	'.site-redesign__toolbar, button:not(.site-redesign__slide-select), a, input, select, [role="radio"]';

export type StageSlide = {
	key: string;
	content: ReactNode;
	/** Names the slide for assistive technology, e.g. "Design 2 of 4". */
	label?: string;
	/** Names the click target that brings this slide to the center. */
	showLabel?: string;
};

// The large preview in the middle with its neighbors at the sides, sized from the space it gets.
export function GalleryStage( {
	slides,
	activeIndex,
	device,
	onSelect,
	toolbar,
	children,
}: {
	slides: StageSlide[];
	activeIndex: number;
	device: PreviewDevice;
	onSelect?: ( index: number ) => void;
	/** The controls for the active design, on the sheet that stays put while the designs move. */
	toolbar: ReactNode;
	/** Controls laid over the stage, such as the previous and next buttons. */
	children?: ReactNode;
} ) {
	const [ stage, setStage ] = useState< Size >( { width: 0, height: 0 } );
	const observeStage = useResizeObserver< HTMLDivElement >( ( [ entry ] ) => {
		if ( entry ) {
			setStage( { width: entry.contentRect.width, height: entry.contentRect.height } );
		}
	} );
	const swipe = useRef< { x: number; y: number } | null >( null );
	const swiped = useRef( false );

	const fit = fitSlide( stage, device, slides.length > 1 );
	const viewport = DEVICE_VIEWPORTS[ device ];
	const direction = isRTL() ? -1 : 1;

	const onPointerDown = ( event: PointerEvent ) => {
		swiped.current = false;
		const onControl = event.target instanceof Element && !! event.target.closest( NOT_SWIPEABLE );
		swipe.current =
			event.pointerType === 'mouse' || onControl ? null : { x: event.clientX, y: event.clientY };
	};
	const onPointerUp = ( event: PointerEvent ) => {
		const start = swipe.current;
		swipe.current = null;
		if ( ! start || ! onSelect ) {
			return;
		}
		const dx = ( event.clientX - start.x ) * direction;
		const dy = event.clientY - start.y;
		if ( Math.abs( dx ) < SWIPE_DISTANCE || Math.abs( dx ) < Math.abs( dy ) * 1.5 ) {
			return;
		}
		const next = activeIndex + ( dx < 0 ? 1 : -1 );
		if ( next >= 0 && next < slides.length ) {
			swiped.current = true;
			onSelect( next );
		}
	};

	return (
		<div
			ref={ observeStage }
			className={ clsx( 'site-redesign__stage', `is-${ device }`, {
				'is-measured': stage.width > 0,
				'is-inset': fit.sheetWidth - fit.width > 1,
			} ) }
			style={
				{
					'--site-redesign-slide-width': `${ fit.width }px`,
					'--site-redesign-slide-height': `${ fit.height }px`,
					'--site-redesign-frame-width': `${ viewport.width }px`,
					'--site-redesign-frame-height': `${ viewport.height }px`,
					'--site-redesign-frame-scale': fit.scale,
					'--site-redesign-sheet-width': `${ fit.sheetWidth }px`,
					'--site-redesign-toolbar-height': `${ fit.toolbar }px`,
				} as CSSProperties
			}
			onPointerDown={ onPointerDown }
			onPointerUp={ onPointerUp }
			onPointerCancel={ () => ( swipe.current = null ) }
		>
			{ slides.map( ( slide, index ) => {
				const offset = index - activeIndex;
				const place = placeSlide( offset, fit );
				const isActive = offset === 0;
				return (
					<div
						key={ slide.key }
						role={ slide.label ? 'group' : undefined }
						aria-roledescription={ slide.label ? __( 'slide' ) : undefined }
						aria-label={ slide.label }
						aria-hidden={ isActive ? undefined : true }
						className={ clsx( 'site-redesign__slide', {
							'is-active': isActive,
							'is-offstage': ! place.visible,
						} ) }
						style={ {
							transform: `translate( ${ place.x * direction }px, ${ place.y }px ) scale( ${
								place.scale
							} )`,
						} }
					>
						{ slide.content }
						{ ! isActive && onSelect && (
							<button
								type="button"
								className="site-redesign__slide-select"
								tabIndex={ -1 }
								aria-label={ slide.showLabel }
								onClick={ () => {
									if ( ! swiped.current ) {
										onSelect( index );
									}
								} }
							/>
						) }
					</div>
				);
			} ) }
			<div className="site-redesign__sheet">
				<div className="site-redesign__toolbar">{ toolbar }</div>
				<div className="site-redesign__sheet-fade" />
			</div>
			{ children }
		</div>
	);
}
