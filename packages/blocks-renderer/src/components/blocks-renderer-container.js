// This file is from the Gutenberg file packages/block-editor/src/components/block-preview/auto.js (d50e613).
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
import './blocks-renderer.scss';

const ScaledBlocksRendererContainer = ( {
	children,
	styles: customStyles = [],
	viewportWidth = 1200,
	containerWidth,
	maxHeight = BLOCK_MAX_HEIGHT,
} ) => {
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

	// Avoid scrollbars for pattern previews.
	const editorStyles = useMemo( () => {
		if ( styles ) {
			return [
				...styles,
				{
					css: 'body{height:auto;overflow:hidden;}',
					__unstableType: 'presets',
				},
			];
		}

		return styles;
	}, [ styles ] );

	const svgFilters = useMemo( () => {
		return [ ...( duotone?.default ?? [] ), ...( duotone?.theme ?? [] ) ];
	}, [ duotone ] );

	const contentRef = useRefEffect( ( bodyElement ) => {
		const {
			ownerDocument: { documentElement },
		} = bodyElement;
		documentElement.classList.add( 'blocks-renderer__iframe' );
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
			className="scaled-blocks-renderer"
			style={ {
				transform: `scale(${ scale })`,
				height: contentHeight * scale,
				maxHeight: contentHeight > maxHeight ? maxHeight * scale : undefined,
				minHeight: '1px',
			} }
		>
			<Iframe
				head={
					<>
						<EditorStyles styles={ editorStyles } />
						<EditorStyles styles={ customStyles } />
					</>
				}
				assets={ assets }
				contentRef={ contentRef }
				aria-hidden
				tabIndex={ -1 }
				style={ {
					position: 'absolute',
					width: viewportWidth,
					height: contentHeight,
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

const BlocksRendererContainer = ( { viewportWidth, enableDynamicViewport, ...props } ) => {
	const [ containerResizeListener, { width: containerWidth } ] = useResizeObserver();

	return (
		<>
			<div style={ { position: 'relative', width: '100%', height: 0 } }>
				{ containerResizeListener }
			</div>
			<div className="blocks-renderer">
				{ !! containerWidth && (
					<ScaledBlocksRendererContainer
						{ ...props }
						viewportWidth={ enableDynamicViewport ? containerWidth : viewportWidth }
						containerWidth={ containerWidth }
					/>
				) }
			</div>
		</>
	);
};

export default BlocksRendererContainer;
