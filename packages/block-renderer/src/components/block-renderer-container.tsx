// The idea of this file is from the Gutenberg file packages/block-editor/src/components/block-preview/auto.js (d50e613).
import {
	store as blockEditorStore,
	__unstableIframe as Iframe,
	__unstableEditorStyles as EditorStyles,
	__unstablePresetDuotoneFilter as PresetDuotoneFilter,
} from '@wordpress/block-editor';
import { useResizeObserver, useRefEffect } from '@wordpress/compose';
import { useSelect } from '@wordpress/data';
import React, { useMemo } from 'react';
import { BLOCK_MAX_HEIGHT } from '../constants';
import type { RenderedStyle } from '../types';
import './block-renderer-container.scss';

interface BlockRendererContainerProps {
	children: React.ReactChild;
	styles?: RenderedStyle[];
	inlineCss?: string;
	viewportWidth?: number;
	maxHeight?: number;
	minHeight?: number;
}

interface ScaledBlockRendererContainerProps extends BlockRendererContainerProps {
	containerWidth: number;
}

const ScaledBlockRendererContainer = ( {
	children,
	styles: customStyles,
	inlineCss = '',
	viewportWidth = 1200,
	containerWidth,
	maxHeight = BLOCK_MAX_HEIGHT,
	minHeight,
}: ScaledBlockRendererContainerProps ) => {
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
	}, [] );

	const scale = containerWidth / viewportWidth;

	return (
		<div
			className="scaled-block-renderer"
			style={ {
				transform: `scale(${ scale })`,
				height: ( contentHeight as number ) * scale || minHeight,
				maxHeight: ( contentHeight as number ) > maxHeight ? maxHeight * scale : undefined,
				minHeight: '1px',
				// Try to avoid showing the content when the styles are not ready
				opacity: contentHeight ? 1 : 0,
				transition: 'opacity 0.3s ease-in-out',
			} }
		>
			<Iframe
				head={ <EditorStyles styles={ editorStyles } /> }
				assets={ assets }
				contentRef={ contentRef }
				aria-hidden
				tabIndex={ -1 }
				style={ {
					position: 'absolute',
					width: viewportWidth,
					height: contentHeight as number,
					pointerEvents: 'none',
					// This is a catch-all max-height for patterns.
					// See: https://github.com/WordPress/gutenberg/pull/38175.
					maxHeight,
				} }
			>
				{ contentResizeListener }
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
