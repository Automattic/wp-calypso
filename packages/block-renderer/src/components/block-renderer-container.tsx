// The idea of this file is from the Gutenberg file packages/block-editor/src/components/block-preview/auto.js (d50e613).
import {
	__unstableIframe as Iframe,
	__unstableEditorStyles as EditorStyles,
	__unstablePresetDuotoneFilter as PresetDuotoneFilter,
} from '@wordpress/block-editor';
import { useResizeObserver, useRefEffect } from '@wordpress/compose';
import React, { useMemo, useState, useContext, ReactNode } from 'react';
import { BLOCK_MAX_HEIGHT } from '../constants';
import useParsedAssets from '../hooks/use-parsed-assets';
import loadScripts from '../utils/load-scripts';
import loadStyles from '../utils/load-styles';
import BlockRendererContext from './block-renderer-context';
import type { RenderedStyle } from '../types';
import './block-renderer-container.scss';

interface BlockRendererContainerProps {
	children: ReactNode;
	styles?: RenderedStyle[];
	scripts?: string;
	inlineCss?: string;
	viewportWidth?: number;
	viewportHeight?: number;
	maxHeight?: 'none' | number;
	minHeight?: number;
	isMinHeight100vh?: boolean;
	minHeightFor100vh?: number;
}

interface ScaledBlockRendererContainerProps extends BlockRendererContainerProps {
	containerWidth: number;
}

const ScaledBlockRendererContainer = ( {
	children,
	styles: customStyles,
	scripts: customScripts,
	inlineCss = '',
	viewportWidth = 1200,
	viewportHeight,
	containerWidth,
	maxHeight = BLOCK_MAX_HEIGHT,
	minHeight,
	isMinHeight100vh,
	minHeightFor100vh,
}: ScaledBlockRendererContainerProps ) => {
	const [ isLoaded, setIsLoaded ] = useState( false );
	const [ contentResizeListener, { height: contentHeight } ] = useResizeObserver();
	const { settings } = useContext( BlockRendererContext );
	const { styles, assets, duotone } = useMemo(
		() => ( {
			styles: settings.styles,
			assets: settings.__unstableResolvedAssets,
			duotone: settings.__experimentalFeatures?.color?.duotone,
		} ),
		[ settings ]
	);

	const styleAssets = useParsedAssets( assets?.styles ) as HTMLLinkElement[];

	const editorStyles = useMemo( () => {
		const mergedStyles = [ ...( styles || [] ), ...( customStyles || [] ) ]
			// Ignore svgs since the current version of EditorStyles doesn't support it
			.filter( ( style: RenderedStyle ) => style.__unstableType !== 'svgs' );

		if ( ! inlineCss ) {
			return mergedStyles;
		}

		return [ ...mergedStyles, { css: inlineCss } ];
	}, [ styles, customStyles, inlineCss ] );

	const scripts = useMemo( () => {
		return [ assets?.scripts, customScripts ].filter( Boolean ).join( '' );
	}, [ assets?.scripts, customScripts ] );

	const scriptAssets = useParsedAssets( scripts );

	const svgFilters = useMemo( () => {
		return [ ...( duotone?.default ?? [] ), ...( duotone?.theme ?? [] ) ];
	}, [ duotone ] );

	const contentRef = useRefEffect< HTMLBodyElement >( ( bodyElement ) => {
		const {
			ownerDocument: { documentElement },
		} = bodyElement;
		documentElement.classList.add( 'block-renderer__iframe' );
		documentElement.style.position = 'absolute';
		documentElement.style.width = '100%';

		// Necessary for contentResizeListener to work.
		bodyElement.style.boxSizing = 'border-box';
		bodyElement.style.position = 'absolute';
		bodyElement.style.width = '100%';

		// Load scripts and styles manually to avoid a flash of unstyled content.
		Promise.all( [
			loadStyles( bodyElement, styleAssets ),
			loadScripts( bodyElement, scriptAssets as HTMLScriptElement[] ),
		] ).then( () => setIsLoaded( true ) );
	}, [] );

	const scale = containerWidth / viewportWidth;
	const heightFor100vh = Math.max(
		contentHeight || 0,
		viewportHeight || 0,
		minHeightFor100vh || 0
	);

	let scaledHeight = ( contentHeight as number ) * scale || minHeight;
	if ( isMinHeight100vh ) {
		// Handling container height of patterns with height 100vh
		scaledHeight = heightFor100vh * scale;
	}

	let iframeHeight = contentHeight as number;
	if ( isMinHeight100vh ) {
		// Handling iframe height of patterns with height 100vh
		iframeHeight = heightFor100vh;
	}

	return (
		<div
			className="scaled-block-renderer"
			style={ {
				transform: `scale(${ scale })`,
				height: scaledHeight,
				maxHeight:
					maxHeight !== 'none' && ( contentHeight as number ) > maxHeight
						? ( maxHeight as number ) * scale
						: undefined,
			} }
		>
			<Iframe
				contentRef={ contentRef }
				aria-hidden
				tabIndex={ -1 }
				loading="lazy"
				style={ {
					position: 'absolute',
					width: viewportWidth,
					height: iframeHeight,
					pointerEvents: 'none',
					// This is a catch-all max-height for patterns.
					// See: https://github.com/WordPress/gutenberg/pull/38175.
					maxHeight,
					// Avoid showing the unstyled content
					opacity: isLoaded ? 1 : 0,
				} }
			>
				<EditorStyles styles={ editorStyles } />
				{ isLoaded ? contentResizeListener : null }
				{
					/* Filters need to be rendered before children to avoid Safari rendering issues. */
					svgFilters.map( ( preset ) => (
						<PresetDuotoneFilter preset={ preset } key={ preset.slug } />
					) )
				}
				{ children }
			</Iframe>
		</div>
	);
};

const BlockRendererContainer = ( { viewportWidth, ...props }: BlockRendererContainerProps ) => {
	const [ containerResizeListener, { width: containerWidth } ] = useResizeObserver();

	return (
		<>
			<div style={ { position: 'relative', width: '100%', height: 0 } }>
				{ containerResizeListener }
			</div>
			<div className="block-renderer">
				{ !! containerWidth && (
					<ScaledBlockRendererContainer
						{ ...props }
						viewportWidth={ viewportWidth || containerWidth }
						containerWidth={ containerWidth }
					/>
				) }
			</div>
		</>
	);
};

export default BlockRendererContainer;
