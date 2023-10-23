import { PatternRenderer } from '@automattic/block-renderer';
import { DeviceSwitcher } from '@automattic/components';
import { useGlobalStyle } from '@automattic/global-styles';
import { Popover } from '@wordpress/components';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import React, { useRef, useEffect, useState, useMemo, CSSProperties } from 'react';
import { PATTERN_ASSEMBLER_EVENTS } from './events';
import PatternActionBar from './pattern-action-bar';
import { encodePatternId } from './utils';
import type { Pattern } from './types';
import './pattern-large-preview.scss';

interface Props {
	header: Pattern | null;
	sections: Pattern[];
	footer: Pattern | null;
	activePosition: number;
	onDeleteSection: ( position: number ) => void;
	onMoveUpSection: ( position: number ) => void;
	onMoveDownSection: ( position: number ) => void;
	onDeleteHeader: () => void;
	onDeleteFooter: () => void;
	onShuffle: ( type: string, pattern: Pattern, position?: number ) => void;
	recordTracksEvent: ( name: string, eventProperties?: any ) => void;
	isNewSite: boolean;
}

// The pattern renderer element has 1px min height before the pattern is loaded
const PATTERN_RENDERER_MIN_HEIGHT = 1;

const LARGE_PREVIEW_OFFSET_TOP = 110;

const PatternLargePreview = ( {
	header,
	sections,
	footer,
	activePosition,
	onDeleteSection,
	onMoveUpSection,
	onMoveDownSection,
	onDeleteHeader,
	onDeleteFooter,
	onShuffle,
	recordTracksEvent,
	isNewSite,
}: Props ) => {
	const translate = useTranslate();
	const hasSelectedPattern = Boolean( header || sections.length || footer );
	const frameRef = useRef< HTMLDivElement | null >( null );
	const listRef = useRef< HTMLUListElement | null >( null );
	const [ viewportHeight, setViewportHeight ] = useState< number | undefined >( 0 );
	const [ device, setDevice ] = useState< string >( 'computer' );
	const [ zoomOutScale, setZoomOutScale ] = useState( 1 );
	const [ backgroundColor ] = useGlobalStyle( 'color.background' );
	const patternLargePreviewStyle = useMemo(
		() =>
			( {
				'--pattern-large-preview-zoom-out-scale': zoomOutScale,
				'--pattern-large-preview-background': backgroundColor,
			} ) as CSSProperties,
		[ zoomOutScale, backgroundColor ]
	);

	const [ activeElement, setActiveElement ] = useState< HTMLElement | null >( null );

	const popoverAnchor = useMemo( () => {
		if ( ! activeElement ) {
			return undefined;
		}

		return {
			getBoundingClientRect() {
				const { left, top, width, height } = activeElement.getBoundingClientRect();

				return new window.DOMRect(
					left,
					// Stick to the top when the partial area of the active element is out of the viewport
					Math.max( top, LARGE_PREVIEW_OFFSET_TOP ),
					width,
					height
				);
			},
		};
	}, [ activeElement ] );

	const renderPattern = ( type: string, pattern: Pattern, position = -1 ) => {
		const isSection = type === 'section';
		const clientId = isSection ? pattern.key : type;
		const isActive = activeElement?.dataset?.clientId === clientId;

		const handleMouseEnter = ( event: React.MouseEvent< HTMLElement > ) => {
			setActiveElement( event.currentTarget );
		};

		const handleMouseLeave = ( event: React.MouseEvent< HTMLElement > ) => {
			if ( ! frameRef.current?.contains( event.relatedTarget as Node ) ) {
				setActiveElement( null );
			}
		};

		const handleDelete = () => {
			setActiveElement( null );
			if ( type === 'header' ) {
				onDeleteHeader();
			} else if ( type === 'footer' ) {
				onDeleteFooter();
			} else {
				onDeleteSection( position );
			}
		};

		return (
			<li
				key={ clientId }
				aria-label={ pattern.title }
				className={ classnames( 'pattern-large-preview__pattern', {
					'pattern-large-preview__pattern--active': isActive,
				} ) }
				data-client-id={ clientId }
				onMouseEnter={ handleMouseEnter }
			>
				{ !! viewportHeight && (
					<PatternRenderer
						key={ device }
						patternId={ encodePatternId( pattern.ID ) }
						viewportHeight={ viewportHeight }
						// Disable default max-height
						maxHeight="none"
						shouldShufflePosts={ isNewSite }
					/>
				) }
				{ isActive && (
					<Popover
						animate={ false }
						focusOnMount={ false }
						resize={ false }
						flip={ false }
						anchor={ popoverAnchor }
						placement="top-start"
						variant="unstyled"
					>
						<PatternActionBar
							patternType={ type }
							category={ pattern.category }
							source="large_preview"
							isOverflow={ zoomOutScale < 0.75 }
							disableMoveUp={ position === 0 }
							disableMoveDown={ sections?.length === position + 1 }
							onMoveUp={ isSection ? () => onMoveUpSection( position ) : undefined }
							onMoveDown={ isSection ? () => onMoveDownSection( position ) : undefined }
							onShuffle={ () => onShuffle( type, pattern, position ) }
							onDelete={ handleDelete }
							onMouseLeave={ handleMouseLeave }
						/>
					</Popover>
				) }
			</li>
		);
	};

	const updateViewportHeight = ( height?: number ) => {
		// Required for 100vh patterns
		setViewportHeight( height );
	};

	// Scroll to newly added patterns
	useEffect( () => {
		let timerId: number;
		const scrollIntoView = () => {
			const element = listRef.current?.children[ activePosition ];
			if ( ! element ) {
				return;
			}

			const { height } = element.getBoundingClientRect();

			// Use the height to determine whether the newly added pattern is loaded.
			// If it's not loaded, try to delay the behavior of scrolling into view.
			if ( height && height > PATTERN_RENDERER_MIN_HEIGHT ) {
				// Note that Firefox has an issue related to "smooth" behavior, so we leave it as default
				// See https://github.com/Automattic/wp-calypso/pull/71527#issuecomment-1370522634
				element.scrollIntoView();
			} else {
				timerId = window.setTimeout( () => scrollIntoView(), 100 );
			}
		};

		scrollIntoView();

		return () => {
			if ( timerId ) {
				window.clearTimeout( timerId );
			}
		};
	}, [ activePosition, header, sections, footer ] );

	// Unset the hovered element when the mouse is leaving the large preview
	useEffect( () => {
		const handleMouseLeave = ( event: MouseEvent ) => {
			const relatedTarget = event.relatedTarget as HTMLElement | null;
			if ( ! relatedTarget?.closest( '.pattern-assembler__pattern-action-bar' ) ) {
				setActiveElement( null );
			}
		};

		frameRef.current?.addEventListener( 'mouseleave', handleMouseLeave );
		return () => {
			frameRef.current?.removeEventListener( 'mouseleave', handleMouseLeave );
		};
	}, [ frameRef, setActiveElement ] );

	return (
		<DeviceSwitcher
			className="pattern-large-preview"
			isShowDeviceSwitcherToolbar
			isShowFrameBorder
			isShowFrameShadow={ false }
			isFixedViewport={ !! hasSelectedPattern }
			isZoomable={ hasSelectedPattern }
			frameRef={ frameRef }
			onDeviceChange={ ( device ) => {
				recordTracksEvent( PATTERN_ASSEMBLER_EVENTS.PREVIEW_DEVICE_CLICK, { device } );
				setDevice( device );
			} }
			onViewportChange={ updateViewportHeight }
			onZoomOutScaleChange={ setZoomOutScale }
		>
			{ hasSelectedPattern ? (
				<ul
					className="pattern-large-preview__patterns"
					style={ patternLargePreviewStyle }
					ref={ listRef }
				>
					{ header && renderPattern( 'header', header ) }
					{ sections.map( ( pattern, i ) => renderPattern( 'section', pattern, i ) ) }
					{ footer && renderPattern( 'footer', footer ) }
				</ul>
			) : (
				<div className="pattern-large-preview__placeholder">
					<h2>{ translate( 'Welcome to your homepage.' ) }</h2>
					<span>
						{ translate( "It's time to get creative. Add your first pattern to get started." ) }
					</span>
				</div>
			) }
		</DeviceSwitcher>
	);
};

export default PatternLargePreview;
