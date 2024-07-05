// The idea of this file is from the Gutenberg file packages/block-editor/src/components/block-preview/auto.js (d50e613).
import {
	__unstableIframe as Iframe,
	__unstableEditorStyles as EditorStyles,
	privateApis as blockEditorPrivateApis,
} from '@wordpress/block-editor';
import { useResizeObserver, useRefEffect, useMergeRefs } from '@wordpress/compose';
import { __dangerousOptInToUnstableAPIsOnlyForCoreModules } from '@wordpress/private-apis';
import React, { useMemo, useState, useContext, CSSProperties, ReactNode } from 'react';
import { BLOCK_MAX_HEIGHT } from '../constants';
import useParsedAssets from '../hooks/use-parsed-assets';
import loadScripts from '../utils/load-scripts';
import loadStyles from '../utils/load-styles';
import BlockRendererContext from './block-renderer-context';
import type { RenderedStyle } from '../types';
import './block-renderer-container.scss';

const { unlock } = __dangerousOptInToUnstableAPIsOnlyForCoreModules(
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	( window as any ).wpcomGutenberg?.pluginVersion?.startsWith( 'v18.7' )
		? 'I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.'
		: 'I know using unstable features means my theme or plugin will inevitably break in the next version of WordPress.',
	'@wordpress/block-editor'
);

const { getDuotoneFilter } = unlock( blockEditorPrivateApis );

const isSafari =
	window?.navigator.userAgent &&
	window.navigator.userAgent.includes( 'Safari' ) &&
	! window.navigator.userAgent.includes( 'Chrome' ) &&
	! window.navigator.userAgent.includes( 'Chromium' );

interface BlockRendererContainerProps {
	children: ReactNode;
	styles?: RenderedStyle[];
	scripts?: string;
	viewportWidth?: number;
	maxHeight?: 'none' | number;
	minHeight?: number;
}

interface ScaledBlockRendererContainerProps extends BlockRendererContainerProps {
	containerWidth: number;
}

const ScaledBlockRendererContainer = ( {
	children,
	styles: customStyles,
	scripts: customScripts,
	viewportWidth = 1200,
	containerWidth,
	maxHeight = BLOCK_MAX_HEIGHT,
	minHeight,
}: ScaledBlockRendererContainerProps ) => {
	const [ isLoaded, setIsLoaded ] = useState( false );
	const [ contentResizeListener, sizes ] = useResizeObserver();
	const contentHeight = sizes.height ?? 0;
	const { settings } = useContext( BlockRendererContext );
	const { styles, assets, duotone } = useMemo(
		() => ( {
			styles: settings.styles.map( ( styles: RenderedStyle ) => {
				if ( ! isSafari || ! styles.css || ! styles.css.includes( 'body' ) ) {
					return styles;
				}

				// The Iframe component injects the CSS rule body{ background: white } to <head>.
				// In Safari, this creates a specificity issue that prevents other background colors
				// to be applied to the body.
				// As a solution, we use regex to add !important to these background colors.
				//
				// TODO: Remove this workaround when https://github.com/WordPress/gutenberg/pull/60106
				// lands in Calypso's @wordpress/block-editor, which should be 12.23.0.
				const regex = /(body\s*{[\s\S]*?\bbackground-color\s*:\s*([^;}]+)\s*;[\s\S]*?})/g;
				styles.css = styles.css.replace( regex, ( match, cssRule, bgColor ) => {
					return ! bgColor.includes( '!important' )
						? cssRule.replace( bgColor, bgColor + ' !important' )
						: cssRule;
				} );

				return styles;
			} ),
			assets: settings.__unstableResolvedAssets,
			duotone: settings.__experimentalFeatures?.color?.duotone,
		} ),
		[ settings, isSafari ]
	);

	const styleAssets = useParsedAssets( assets?.styles ) as HTMLLinkElement[];

	const editorStyles = useMemo( () => {
		const mergedStyles = [ ...( styles || [] ), ...( customStyles || [] ) ]
			// Ignore svgs since the current version of EditorStyles doesn't support it
			.filter( ( style: RenderedStyle ) => style.__unstableType !== 'svgs' );

		return mergedStyles;
	}, [ styles, customStyles ] );

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
	}, [] );

	const contentAssetsRef = useRefEffect< HTMLBodyElement >( ( bodyElement ) => {
		// Load scripts and styles manually to avoid a flash of unstyled content.
		Promise.all( [
			loadStyles( bodyElement, styleAssets ),
			loadScripts( bodyElement, scriptAssets as HTMLScriptElement[] ),
		] ).then( () => setIsLoaded( true ) );
	}, [] );

	const scale = containerWidth / viewportWidth;
	const scaledHeight = contentHeight * scale || minHeight;

	return (
		<div
			className="scaled-block-renderer"
			style={
				{
					'--scaled-block-renderer-scale': scale,
					height: scaledHeight,
					maxHeight:
						maxHeight && maxHeight !== 'none' && contentHeight > maxHeight
							? maxHeight * scale
							: undefined,
				} as CSSProperties
			}
		>
			<Iframe
				contentRef={ useMergeRefs( [ contentRef, contentAssetsRef ] ) }
				aria-hidden
				tabIndex={ -1 }
				loading="lazy"
				style={ {
					position: 'absolute',
					width: viewportWidth,
					height: contentHeight,
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
						<div
							key={ preset.slug }
							// eslint-disable-next-line react/no-danger
							dangerouslySetInnerHTML={ {
								__html: getDuotoneFilter( `wp-duotone-${ preset.slug }`, preset.colors ),
							} }
						/>
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
