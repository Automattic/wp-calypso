import { PatternRenderer } from '@automattic/block-renderer';
import { isEnabled } from '@automattic/calypso-config';
import { __unstableCompositeItem as CompositeItem } from '@wordpress/components';
import clsx from 'clsx';
import { CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import useOutsideClickCallback from 'calypso/lib/use-outside-click-callback';
import { DEFAULT_VIEWPORT_WIDTH, DEFAULT_VIEWPORT_HEIGHT } from '../constants';
import { PATTERN_ASSEMBLER_EVENTS } from '../events';
import prependTitleBlockToPagePattern from '../html-transformers/prepend-title-block-to-page-pattern';
import PatternTooltipDeadClick from '../pattern-tooltip-dead-click';
import { encodePatternId, isPagePattern } from '../utils';
import type { Pattern } from '../types';
import './page-preview.scss';

interface BasePageProps {
	style: CSSProperties;
	patterns: Pattern[];
	transformPatternHtml: ( patternHtml: string ) => string;
}

interface PageProps extends BasePageProps {
	className: string;
}

interface PagePreviewProps extends BasePageProps {
	composite: Record< string, unknown >;
	slug: string;
	title: string;
	onFullscreenEnter: () => void;
	onFullscreenLeave: () => void;
}

const Page = ( { className, style, patterns, transformPatternHtml }: PageProps ) => {
	const pageTitle = useMemo( () => {
		return patterns.find( isPagePattern )?.title ?? '';
	}, [ patterns ] );

	const transformPagePatternHtml = useCallback(
		( patternHtml: string ) => {
			const transformedPatternHtml = transformPatternHtml( patternHtml );
			if ( isEnabled( 'pattern-assembler/v2' ) ) {
				return transformedPatternHtml;
			}
			return prependTitleBlockToPagePattern( transformedPatternHtml, pageTitle );
		},
		[ transformPatternHtml, pageTitle ]
	);

	return (
		<div className={ className } style={ style }>
			{ patterns.map( ( pattern ) => (
				<PatternRenderer
					key={ pattern.ID }
					maxHeight="none"
					patternId={ encodePatternId( pattern.ID ) }
					viewportWidth={ DEFAULT_VIEWPORT_WIDTH }
					viewportHeight={ DEFAULT_VIEWPORT_HEIGHT }
					transformHtml={
						isPagePattern( pattern ) ? transformPagePatternHtml : transformPatternHtml
					}
				/>
			) ) }
		</div>
	);
};

const PatternPagePreview = ( {
	composite,
	onFullscreenEnter,
	onFullscreenLeave,
	...pageProps
}: PagePreviewProps ) => {
	const { slug, title } = pageProps;
	const [ isFullscreen, setIsFullscreen ] = useState( false );
	const [ isFullscreenEnter, setIsFullscreenEnter ] = useState( false );
	const [ isFullscreenLeave, setIsFullscreenLeave ] = useState( false );
	const [ shouldShowTooltip, setShouldShowTooltip ] = useState( false );

	const [ frameStyles, setFrameStyles ] = useState( {} );
	const ref = useRef< HTMLDivElement >( null );
	const frameRef = useRef( null );

	const calculateFrameStyles = useCallback( () => {
		if ( ! ref.current ) {
			return;
		}

		const { height, width, x, y } = ref.current.getBoundingClientRect();
		setFrameStyles( {
			'--fullscreen-scale': ( window.innerHeight * 0.8 ) / height,
			'--fullscreen-x': x + width / 2,
			'--fullscreen-y': y + height / 2,
		} );
	}, [ ref ] );

	const handleFullscreenEnter = () => {
		if ( ! isFullscreen ) {
			setIsFullscreen( true );
			onFullscreenEnter();

			// The timeout delay should match the CSS transition timing of the element.
			setIsFullscreenEnter( true );
			setTimeout( () => setIsFullscreenEnter( false ), 200 );

			recordTracksEvent( PATTERN_ASSEMBLER_EVENTS.SCREEN_PAGES_PAGE_PREVIEW_CLICK, {
				page_slug: slug,
			} );
		}
	};

	// Use useCallback since useOutsideClickCallback memoizes the callback function.
	const handleFullscreenLeave = useCallback( () => {
		if ( isFullscreen ) {
			setIsFullscreen( false );
			onFullscreenLeave();

			// The timeout delay should match the CSS transition timing of the element.
			setIsFullscreenLeave( true );
			setTimeout( () => setIsFullscreenLeave( false ), 200 );
		}
	}, [ isFullscreen, onFullscreenLeave ] );

	const handleMouseDown = () => {
		if ( isFullscreen ) {
			setShouldShowTooltip( true );
		}
	};

	const handleMouseLeave = () => {
		if ( isFullscreen ) {
			setShouldShowTooltip( false );
		}
	};

	useEffect( () => {
		if ( isFullscreen ) {
			calculateFrameStyles();
		}
	}, [ isFullscreen, calculateFrameStyles ] );

	useEffect( () => {
		window.addEventListener( 'resize', calculateFrameStyles );
		return () => {
			window.removeEventListener( 'resize', calculateFrameStyles );
		};
	}, [ calculateFrameStyles ] );

	useOutsideClickCallback( ref, handleFullscreenLeave );

	return (
		<div
			className={ clsx( 'pattern-assembler__preview', {
				'pattern-assembler__preview--fullscreen': isFullscreen,
				'pattern-assembler__preview--fullscreen-enter': isFullscreenEnter,
				'pattern-assembler__preview--fullscreen-leave': isFullscreenLeave,
			} ) }
		>
			<div className="pattern-assembler__preview-container" ref={ ref }>
				<CompositeItem
					{ ...composite }
					role="option"
					as="button"
					ref={ frameRef }
					className="pattern-assembler__preview-frame"
					style={ frameStyles }
					aria-label={ title }
					onClick={ handleFullscreenEnter }
					onMouseDown={ handleMouseDown }
					onMouseLeave={ handleMouseLeave }
				>
					<Page className="pattern-assembler__preview-frame-content" { ...pageProps } />
				</CompositeItem>
				<div className="pattern-assembler__preview-title">{ title }</div>
			</div>
			{ isFullscreen && (
				<PatternTooltipDeadClick targetRef={ frameRef } isVisible={ shouldShowTooltip } />
			) }
		</div>
	);
};

export default PatternPagePreview;
