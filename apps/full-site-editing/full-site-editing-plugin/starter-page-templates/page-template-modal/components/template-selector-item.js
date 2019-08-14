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
import { BlockPreview } from '@wordpress/block-editor';

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
	} = props;

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
			onClick={ () => onSelect( value, label ) }
			onMouseEnter={ throttle( () => onFocus( value, label ), 300) }
			aria-describedby={ help ? `${ id }__help` : undefined }
		>
			<div className="template-selector-item__preview-wrap">{ innerPreview }</div>
			{ label }
		</button>
	);
};

export default TemplateSelectorItem;
