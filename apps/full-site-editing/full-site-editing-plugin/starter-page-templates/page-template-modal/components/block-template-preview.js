/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import { useRef, useLayoutEffect, useState } from "@wordpress/element";

/**
 * WordPress dependencies
 */
import { BlockPreview } from '@wordpress/block-editor';

const BlockTemplatePreview = ( { blocks, viewportWidth } ) => {
	const itemRef = useRef( null );
	const [ dynamicCssClasses, setDynamicCssClasses ] = useState( 'is-rendering' );

	useLayoutEffect( () => {
		const timerId = setTimeout( () => {
			const el = itemRef ? itemRef.current : null;

			if ( ! el ) {
				setDynamicCssClasses( '' );
				return;
			}

			// Try to pick up the editor styles wrapper element,
			// and move its `.editor-styles-wrapper` class out of the preview.
			const editorStylesWrapperEl = el.querySelector( '.editor-styles-wrapper' );
			if ( editorStylesWrapperEl ) {
				setTimeout( () => {
					editorStylesWrapperEl.classList.remove( 'editor-styles-wrapper' );
				}, 0 );
				setDynamicCssClasses( 'editor-styles-wrapper' );
			}
		}, 0 );

		// Cleanup
		return () => {
			if ( timerId ) {
				window.clearTimeout( timerId );
			}
		};
	}, [ blocks ] );

	if ( ! blocks ) {
		return null;
	}

	return (
		<div ref={ itemRef } className={ dynamicCssClasses }>
			<BlockPreview blocks={ blocks } viewportWidth={ viewportWidth } />
		</div>
	);
};

export default  BlockTemplatePreview;
