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
import { useMemo } from '@wordpress/element';
import { parse as parseBlocks } from '@wordpress/blocks';
import { BlockPreview } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import replacePlaceholders from '../utils/replace-placeholders';

// Load config passed from backend.
const {
	siteInformation = {},
} = window.starterPageTemplatesConfig;

/*
 * It renders the block preview content for the template.
 * It the templates blocks are not ready yet or not exist,
 * it tries to render a static image, or simply return null.
 */
const TemplateSelectorItem = ( { id, value, help, onSelect, label, rawBlocks } ) => {

	const blocks = useMemo( () => parseBlocks( rawBlocks ), [ rawBlocks ] );

	return (
		<button
			type="button"
			id={ `${ id }-${ value }` }
			className="template-selector-control__label"
			value={ value }
			onClick={ () => onSelect( value, label, blocks ) }
			aria-describedby={ help ? `${ id }__help` : undefined }
		>
			<div className="template-selector-control__preview-wrap">
				{ blocks && blocks.length ? (
					<BlockPreview blocks={ blocks } viewportWidth={ 800 } />
				) : null }
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
				{ templates.map( template => (
					<li key={ `${ id }-${ template.value }` } className="template-selector-control__template">
						<TemplateSelectorItem
							id={ id }
							value={ template.slug }
							label={ replacePlaceholders( template.title, siteInformation ) }
							help={ help }
							onSelect={ onTemplateSelect }
							rawBlocks={ replacePlaceholders( template.content, siteInformation ) }
						/>
					</li>
				) ) }
			</ul>
		</BaseControl>
	);
}

export default withInstanceId( TemplateSelectorControl );
