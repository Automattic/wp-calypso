/**
 * External dependencies
 */
import { isEmpty, noop } from 'lodash';
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { withInstanceId } from '@wordpress/compose';
import { BaseControl } from '@wordpress/components';
import { useMemo, useRef, useLayoutEffect, useState } from '@wordpress/element';
import { parse as parseBlocks } from '@wordpress/blocks';
import { BlockPreview } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import replacePlaceholders from '../utils/replace-placeholders';

// Load config passed from backend.
const { siteInformation = {} } = window.starterPageTemplatesConfig;

/*
 * It renders the block preview content for the template.
 * It the templates blocks are not ready yet or not exist,
 * it tries to render a static image, or simply return null.
 */
const TemplateDynamicPreview = ( { value, rawBlocks } ) => {
	const itemRef = useRef( null );
	const [ dynamicCssClasses, setDynamicCssClasses ] = useState( 'is-rendering' );

	const blocks = useMemo( () => parseBlocks( rawBlocks ).slice( 0, 10 ), [ rawBlocks ] );

	useLayoutEffect( () => {
		const timerId = setTimeout( () => {
			const el = itemRef ? itemRef.current : null;

			if ( ! el ) {
				console.timeEnd( `tpl-${ value }` );
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
		}, 0 );

		console.timeEnd( `tpl-${ value }` );

		// Cleanup
		return () => {
			if ( timerId ) {
				window.clearTimeout( timerId );
			}
		};
	}, [ blocks, value ] );

	return (
		<div ref={ itemRef } className={ dynamicCssClasses }>
			{ blocks && blocks.length ? <BlockPreview blocks={ blocks } viewportWidth={ 800 } /> : null }
		</div>
	);
};

const TemplateSelectorItem = ( {
	id,
	value,
	help,
	onSelect,
	label,
	rawBlocks,
	dynamicPreview = false,
	preview,
	previewAlt = '',
} ) => {
	const innerPreview = dynamicPreview ? (
		<TemplateDynamicPreview
			id={ id }
			value={ value }
			label={ replacePlaceholders( label, siteInformation ) }
			help={ help }
			onSelect={ onSelect }
			preview={ preview }
			rawBlocks={ replacePlaceholders( rawBlocks, siteInformation ) }
		/>
	) : (
		<img
			className="template-selector-control__media"
			src={ preview }
			alt={ previewAlt || '' }
		/>
	);

	return (
		<button
			type="button"
			id={ `${ id }-${ value }` }
			className="template-selector-control__label"
			value={ value }
			onClick={ () => onSelect( value, label, parseBlocks( rawBlocks ) ) }
			aria-describedby={ help ? `${ id }__help` : undefined }
		>
			<div className="template-selector-control__preview-wrap">
				{ innerPreview }
			</div>
			{ label }
		</button>
	);
};

function TemplateSelectorControl( {
	label,
	className,
	help,
	instanceId,
	onTemplateSelect = noop,
	templates = [],
	dynamicPreview = false,
} ) {
	if ( isEmpty( templates ) ) {
		return null;
	}

	const id = `template-selector-control-${ instanceId }`;

	return (
		<BaseControl
			label={ label }
			id={ id }
			help={ help }
			className={ classnames( className, 'template-selector-control' ) }
		>
			<ul className="template-selector-control__options">
				{ templates.map( ( { slug, title, content, preview, previewAlt, value } ) => (
					<li key={ `${ id }-${ value }` } className="template-selector-control__template">
						<TemplateSelectorItem
							id={ id }
							value={ slug }
							label={ replacePlaceholders( title, siteInformation ) }
							help={ help }
							onSelect={ onTemplateSelect }
							preview={ preview }
							previewAlt={ previewAlt }
							rawBlocks={ replacePlaceholders( content, siteInformation ) }
							dynamicPreview={ dynamicPreview }
						/>
					</li>
				) ) }
			</ul>
		</BaseControl>
	);
}

export default withInstanceId( TemplateSelectorControl );
