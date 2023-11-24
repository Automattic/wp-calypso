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
	shouldShufflePosts: boolean;
}

interface PageProps extends BasePageProps {
	className: string;
}

interface PagePreviewProps extends BasePageProps {
	composite: Record< string, unknown >;
	slug: string;
	title: string;
}

const PATTERN_PAGE_PREVIEW_ITEM_VIEWPORT_HEIGHT = 500;
const PATTERN_PAGE_PREVIEW_ITEM_VIEWPORT_WIDTH = 1080;

const Page = ( {
	className,
	style,
	patterns,
	transformPatternHtml,
	shouldShufflePosts,
}: PageProps ) => {
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
					shouldShufflePosts={ shouldShufflePosts }
				/>
			) ) }
		</div>
	);
};

const PatternPagePreview = ( { composite, ...pageProps }: PagePreviewProps ) => {
	const { slug, title, patterns } = pageProps;
	const [ isFullscreen, setIsFullscreen ] = useState( false );
	const [ frameStyles, setFrameStyles ] = useState( {} );
	const ref = useRef< HTMLButtonElement >( null );

	const calculateFrameStyles = useCallback( () => {
		if ( ! ref.current ) {
			return;
		}

		const { height, width, x, y } = ref.current.getBoundingClientRect();
		setFrameStyles( {
			'--fullscreen-offset-x': x + width / 2,
			'--fullscreen-offset-y': y + height / 2,
		} );
	}, [ ref ] );

	const onClick = () => {
		if ( isFullscreen ) {
			return;
		}

		setIsFullscreen( true );
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
		const onResize = () => setIsFullscreen( false );
		window.addEventListener( 'resize', onResize );

		return () => {
			window.removeEventListener( 'resize', onResize );
		};
	}, [] );

	useOutsideClickCallback( ref, () => setIsFullscreen( false ) );

	return (
		<div
			className={ classnames( 'pattern-assembler__preview', {
				'pattern-assembler__preview--fullscreen': isFullscreen,
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
				onClick={ onClick }
			>
				<Page className="pattern-assembler__preview-frame-content" { ...pageProps } />
			</CompositeItem>
			<div className="pattern-assembler__preview-title">{ title }</div>
		</div>
	);
};

export default PatternPagePreview;
