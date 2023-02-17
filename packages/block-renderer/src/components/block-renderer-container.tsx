// The idea of this file is from the Gutenberg file packages/block-editor/src/components/block-preview/auto.js (d50e613).
import {
	store as blockEditorStore,
	__unstableIframe as Iframe,
	__unstableEditorStyles as EditorStyles,
	__unstablePresetDuotoneFilter as PresetDuotoneFilter,
} from '@wordpress/block-editor';
import { useResizeObserver, useRefEffect } from '@wordpress/compose';
import { useSelect } from '@wordpress/data';
import React, { useMemo, useState } from 'react';
import { BLOCK_MAX_HEIGHT } from '../constants';
import type { RenderedStyle } from '../types';
import './block-renderer-container.scss';

interface BlockRendererContainerProps {
	children: React.ReactChild;
	styles?: RenderedStyle[];
	inlineCss?: string;
	viewportWidth?: number;
	viewportHeight?: number;
	maxHeight?: string | number;
	minHeight?: number;
	isMinHeight100vh?: boolean;
	maxHeightFor100vh?: number;
}

interface ScaledBlockRendererContainerProps extends BlockRendererContainerProps {
	containerWidth: number;
}

const useParsedAssets = ( html: string ) => {
	return useMemo( () => {
		const doc = document.implementation.createHTMLDocument( '' );
		doc.body.innerHTML = html;
		return Array.from( doc.body.children );
	}, [ html ] );
};

const loadStyle = async (
	element: HTMLElement,
	{ tagName, id, href, rel, media, textContent }: HTMLLinkElement
) => {
	return new Promise( ( resolve, reject ) => {
		const style = element.ownerDocument.createElement( tagName ) as HTMLLinkElement;
		style.id = id;
		if ( href ) {
			style.href = href;
			style.rel = rel;
			style.media = media;
			style.onload = () => resolve( style );
			style.onerror = () => reject();
		} else {
			style.textContent = textContent;
			resolve( style );
		}

		element.appendChild( style );
	} );
};

const loadStyles = async ( element: HTMLElement, styles: HTMLLinkElement[] ) => {
	return styles.reduce(
		( promise, style ): Promise< any > => promise.then( () => loadStyle( element, style ) ),
		Promise.resolve()
	);
};

const ScaledBlockRendererContainer = ( {
	children,
	styles: customStyles,
	inlineCss = '',
	viewportWidth = 1200,
	viewportHeight,
	containerWidth,
	maxHeight = BLOCK_MAX_HEIGHT,
	minHeight,
	isMinHeight100vh,
	maxHeightFor100vh,
}: ScaledBlockRendererContainerProps ) => {
	const [ isLoaded, setIsLoaded ] = useState( false );
	const [ contentResizeListener, { height: contentHeight } ] = useResizeObserver();
	const { styles, assets, duotone } = useSelect( ( select ) => {
		// @ts-expect-error Type definition is outdated
		const settings = select( blockEditorStore ).getSettings();
		return {
			styles: settings.styles,
			assets: settings.__unstableResolvedAssets,
			duotone: settings.__experimentalFeatures?.color?.duotone,
		};
	}, [] );

	const styleAssets = useParsedAssets( assets?.styles ) as HTMLLinkElement[];

	const editorStyles = useMemo( () => {
		const mergedStyles = [
			...( styles || [] ),
			...( customStyles || [] ),
			// Avoid scrollbars for pattern previews.
			{
				css: 'body{height:auto;overflow:hidden;}',
				__unstableType: 'presets',
			},
		];

		if ( ! inlineCss ) {
			return mergedStyles;
		}

		return [ ...mergedStyles, { css: inlineCss } ];
	}, [ styles, customStyles, inlineCss ] );

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

		// Load styles manually to avoid a flash of unstyled content.
		// Gutenberg fixed this issue via https://github.com/WordPress/gutenberg/pull/46706 but it requires `@wordpress/block-editor: ^11.2.0`
		loadStyles( bodyElement, styleAssets ).then( () => setIsLoaded( true ) );
	}, [] );

	const scale = containerWidth / viewportWidth;

	let scaledHeight = ( contentHeight as number ) * scale || minHeight;
	if ( isMinHeight100vh && maxHeightFor100vh && ! viewportHeight ) {
		scaledHeight = maxHeightFor100vh * scale;
	}

	let iframeHeight = contentHeight as number;
	if ( isMinHeight100vh ) {
		if ( viewportHeight ) {
			iframeHeight = viewportHeight;
		} else if ( maxHeightFor100vh ) {
			iframeHeight = maxHeightFor100vh;
		}
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
				head={ <EditorStyles styles={ editorStyles } /> }
				assets={ { scripts: assets?.scripts } }
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
