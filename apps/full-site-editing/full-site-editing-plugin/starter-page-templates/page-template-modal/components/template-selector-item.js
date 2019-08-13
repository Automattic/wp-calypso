/**
 * External dependencies
 */

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
		blocksInPreview = 10,
	} = props;

	const itemRef = useRef( null );
	const [ dynamicCssClasses, setDynamicCssClasses ] = useState( 'is-rendering' );
	const [ blocksAmount, setBlocksAmount ] = useState( blocksInPreview );

	const blocks = useMemo(
		() => ( dynamicPreview ? parseBlocks( rawBlocks ).slice( 0, blocksAmount ) : [] ),
		[ rawBlocks, blocksAmount, dynamicPreview ]
	);

	useLayoutEffect( () => {
		const timerId = setTimeout( () => {
			const el = itemRef ? itemRef.current : null;

			if ( ! el ) {
				setDynamicCssClasses( '' );
				return;
			}

			// Try to pick up the editor styles wrapper element.
			const editorStylesWrapperEl = el.querySelector( '.editor-styles-wrapper' );
			if ( editorStylesWrapperEl ) {
				setTimeout( () => {
					editorStylesWrapperEl.classList.remove( 'editor-styles-wrapper' );
				}, 0 );
				setDynamicCssClasses( 'editor-styles-wrapper' );
			}

			// experimental.
			setBlocksAmount( 100 );
		}, 0 );

		// Cleanup
		return () => {
			if ( timerId ) {
				window.clearTimeout( timerId );
			}
		};
	}, [ blocks ] );

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
			onClick={ () => onSelect( value, label, parseBlocks( rawBlocks ) ) }
			onMouseEnter={ () =>
				onFocus( value, label, dynamicPreview ? blocks : parseBlocks( rawBlocks ) )
			}
			aria-describedby={ help ? `${ id }__help` : undefined }
		>
			<div className="template-selector-item__preview-wrap">{ innerPreview }</div>
			{ label }
		</button>
	);
};

export default TemplateSelectorItem;
