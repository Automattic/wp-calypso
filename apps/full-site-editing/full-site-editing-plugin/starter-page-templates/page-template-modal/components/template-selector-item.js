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
import { useRef, useLayoutEffect, useState } from '@wordpress/element';
import BlockPreview from './block-template-preview';

const TemplateSelectorItem = props => {
	const {
		id,
		value,
		help,
		onFocus,
		onSelect,
		label,
		dynamicPreview = false,
		preview,
		previewAlt = '',
		blocks,
		blocksInPreview,
	} = props;

	const itemRef = useRef( null );
	const [ dynamicCssClasses, setDynamicCssClasses ] = useState( 'is-rendering' );
	const [ blocksLimit, setBlockLimit ] = useState( blocksInPreview );

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

	const onFocusHandler = () => {
		if ( blocks.length > blocksLimit ) {
			setBlockLimit( null ); // not blocks limit to template preview
		}

		throttle( () => onFocus( value, label ), 300 );
	};

	const innerPreview = dynamicPreview ? (
		<div ref={ itemRef } className={ dynamicCssClasses }>
			<BlockPreview
				blocks={ blocksLimit ? blocks.slice( 0, blocksLimit ) : blocks }
				viewportWidth={ 800 }
			/>
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
			onClick={ () => onSelect( value, label ) }
			onMouseEnter={ onFocusHandler }
			aria-describedby={ help ? `${ id }__help` : undefined }
		>
			<div className="template-selector-item__preview-wrap">{ innerPreview }</div>
			{ label }
		</button>
	);
};

export default TemplateSelectorItem;
