import { PatternRenderer } from '@automattic/block-renderer';
import { __unstableCompositeItem as CompositeItem } from '@wordpress/components';
import classnames from 'classnames';
import { CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import useOutsideClickCallback from 'calypso/lib/use-outside-click-callback';
import { PATTERN_ASSEMBLER_EVENTS } from './events';
import { encodePatternId, isPagePattern } from './utils';
import type { Pattern } from './types';
import './pattern-page-preview.scss';

interface PatternPagePreviewProps {
	composite: Record< string, unknown >;
	slug: string;
	title: string;
	style: CSSProperties;
	patterns: Pattern[];
	shouldShufflePosts: boolean;
}

const PATTERN_PAGE_PREVIEW_ITEM_VIEWPORT_HEIGHT = 500;
const PATTERN_PAGE_PREVIEW_ITEM_VIEWPORT_WIDTH = 1080;

// A copy of the title block in Creatio 2's page.html.
const getPageTitlePattern = ( title: string ) => `
	<div
		class="wp-block-group has-global-padding is-layout-constrained wp-block-group-is-layout-constrained"
		style="margin-top:var(--wp--preset--spacing--60);margin-bottom:var(--wp--preset--spacing--60)"
	>
		<h2 class="has-text-align-left alignwide wp-block-post-title has-xxxx-large-font-size">
			${ title }
		</h2>
	</div>`;

const PatternPagePreview = ( {
	composite,
	slug,
	title,
	style,
	patterns,
	shouldShufflePosts,
}: PatternPagePreviewProps ) => {
	const validPatterns = useMemo( () => patterns.filter( Boolean ) as Pattern[], [ patterns ] );
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
				<div className="pattern-assembler__preview-frame-content" style={ style }>
					{ validPatterns.map( ( pattern ) => (
						<PatternRenderer
							key={ pattern.ID }
							patternId={ encodePatternId( pattern.ID ) }
							viewportWidth={ PATTERN_PAGE_PREVIEW_ITEM_VIEWPORT_WIDTH }
							viewportHeight={ PATTERN_PAGE_PREVIEW_ITEM_VIEWPORT_HEIGHT }
							prependHtml={ isPagePattern( pattern ) ? getPageTitlePattern( pattern.title ) : '' }
							shouldShufflePosts={ shouldShufflePosts }
						/>
					) ) }
				</div>
			</CompositeItem>
			<div className="pattern-assembler__preview-title">{ title }</div>
		</div>
	);
};

export default PatternPagePreview;
