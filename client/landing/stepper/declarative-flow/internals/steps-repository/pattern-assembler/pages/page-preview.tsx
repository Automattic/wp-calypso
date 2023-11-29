import { PatternRenderer } from '@automattic/block-renderer';
import { __unstableCompositeItem as CompositeItem } from '@wordpress/components';
import classnames from 'classnames';
import { CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import useOutsideClickCallback from 'calypso/lib/use-outside-click-callback';
import { PATTERN_ASSEMBLER_EVENTS } from '../events';
import prependTitleBlockToPagePattern from '../html-transformers/prepend-title-block-to-page-pattern';
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

const PATTERN_PAGE_PREVIEW_ITEM_VIEWPORT_HEIGHT = 500;
const PATTERN_PAGE_PREVIEW_ITEM_VIEWPORT_WIDTH = 1080;

const Page = ( { className, style, patterns, transformPatternHtml }: PageProps ) => {
	const pageTitle = useMemo( () => {
		return patterns.find( isPagePattern )?.title ?? '';
	}, [ patterns ] );

	const transformPagePatternHtml = useCallback(
		( patternHtml: string ) => {
			const transformedPatternHtml = transformPatternHtml( patternHtml );
			return prependTitleBlockToPagePattern( transformedPatternHtml, pageTitle );
		},
		[ transformPatternHtml, pageTitle ]
	);

	return (
		<div className={ className } style={ style }>
			{ patterns.map( ( pattern ) => (
				<PatternRenderer
					key={ pattern.ID }
					patternId={ encodePatternId( pattern.ID ) }
					viewportWidth={ PATTERN_PAGE_PREVIEW_ITEM_VIEWPORT_WIDTH }
					viewportHeight={ PATTERN_PAGE_PREVIEW_ITEM_VIEWPORT_HEIGHT }
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
	const { slug, title, patterns } = pageProps;
	const [ isFullscreen, setIsFullscreen ] = useState( false );
	const [ isFullscreenLeave, setIsFullscreenLeave ] = useState( false );
	const [ frameStyles, setFrameStyles ] = useState( {} );
	const ref = useRef< HTMLButtonElement >( null );

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

	const handleClick = () => {
		handleFullscreenEnter();
		recordTracksEvent( PATTERN_ASSEMBLER_EVENTS.SCREEN_PAGES_PAGE_PREVIEW_CLICK, {
			pattern_names: patterns.map( ( pattern ) => pattern.name ).join( ',' ),
			page_slug: slug,
		} );
	};

	useEffect( () => {
		if ( isFullscreen ) {
			calculateFrameStyles();
		}
	}, [ isFullscreen, calculateFrameStyles ] );

	useEffect( () => {
		window.addEventListener( 'resize', handleFullscreenLeave );
		return () => {
			window.removeEventListener( 'resize', handleFullscreenLeave );
		};
	}, [ handleFullscreenLeave ] );

	useOutsideClickCallback( ref, handleFullscreenLeave );

	return (
		<div
			className={ classnames( 'pattern-assembler__preview', {
				'pattern-assembler__preview--fullscreen': isFullscreen,
				'pattern-assembler__preview--fullscreen-leave': isFullscreenLeave,
			} ) }
		>
			<CompositeItem
				{ ...composite }
				ref={ ref }
				role="option"
				as="button"
				className="pattern-assembler__preview-frame"
				style={ frameStyles }
				aria-label={ title }
				onClick={ handleClick }
			>
				<Page className="pattern-assembler__preview-frame-content" { ...pageProps } />
			</CompositeItem>
			<div className="pattern-assembler__preview-title">{ title }</div>
		</div>
	);
};

export default PatternPagePreview;
