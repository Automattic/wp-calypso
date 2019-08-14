/**
 * External dependencies
 */
import { throttle } from 'lodash';

/**
 * Internal dependencies
 */

/**
 * WordPress dependencies
 */
import { useMemo, useRef, useLayoutEffect, useState } from '@wordpress/element';
import { parse as parseBlocks } from '@wordpress/blocks';
import { BlockPreview } from '@wordpress/block-editor';

const TemplateSelectorItem = props => {
	const {
		id,
		value,
		help,
		onFocus,
		onSelect,
		label,
		rawBlocks,
		dynamicPreview = false,
		preview,
		previewAlt = '',
		blocksInPreview,
	} = props;

	const itemRef = useRef( null );
	const [ dynamicCssClasses, setDynamicCssClasses ] = useState( 'is-rendering' );

	/**
	 * Memoize parsed blocks.
	 * Use blocksInPreview property to limit the amount of blocks to memoize.
	 */
	const blocks = useMemo( () => {
		if ( ! dynamicPreview ) {
			return [];
		}

		const parsedBlocks = parseBlocks( rawBlocks );
		if ( blocksInPreview ) {
			return parsedBlocks.slice( 0, blocksInPreview );
		}

		return parsedBlocks;

	}, [ rawBlocks, blocksInPreview, dynamicPreview ] );

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


	/**
	 * onClick button handler function.
	 * It call the onSelect() function property.
	 *
	 * If it isn't a dynamic preview,
	 * or the blocks amount in the preview is defined (blocksInPreview),
	 * it parses the raw block contents.
	 *
	 * @return {null} Null
	 */
		const onSelectHandler = () => (
			( blocksInPreview || ! dynamicPreview ) ?
				onFocus( value, label, parseBlocks( rawBlocks ) ) :
				onFocus( value, label, blocks )
		);

		/**
		 * onMouseEnter button handler function.
		 * It call the onFocus() function property.
		 *
		 * @return {null} Null
		 */
	const onFocusHandler = () => (
		( blocksInPreview || ! dynamicPreview ) ?
			onFocus( value, label, parseBlocks( rawBlocks ) ) :
			onFocus( value, label, blocks )
	);

	const innerPreview = dynamicPreview ? (
		<div ref={ itemRef } className={ dynamicCssClasses }>
			{ blocks && blocks.length ? <BlockPreview blocks={ blocks } viewportWidth={ 800 } /> : null }
		</div>
	) : (
		<img className="template-selector-item__media" src={ preview } alt={ previewAlt } />
	);

	return (
		<button
			type="button"
			id={ `${ id }-${ value }` }
			className="template-selector-item__label"
			value={ value }
			onClick={ onSelectHandler }
			onMouseEnter={ throttle( onFocusHandler, 300) }
			aria-describedby={ help ? `${ id }__help` : undefined }
		>
			<div className="template-selector-item__preview-wrap">{ innerPreview }</div>
			{ label }
		</button>
	);
};

export default TemplateSelectorItem;
