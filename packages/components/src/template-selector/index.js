/**
 * External dependencies
 */
import React from 'react';
import { isEmpty, isArray, noop, map } from 'lodash';
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
// import { withInstanceId, compose } from '@wordpress/compose';
// import { BaseControl } from '@wordpress/components';
// import { memo } from '@wordpress/element';

import './style.scss';

/**
 * Internal dependencies
 */
import TemplateSelectorItem from './item';
import replacePlaceholders from './utils/replace-placeholders';

export const TemplateSelector = ( {
	label,
	className,
	help,
	instanceId,
	templates = [],
	blocksByTemplates = {},
	useDynamicPreview = false,
	onTemplateSelect = noop,
	siteInformation = {},
	selectedTemplate,
	handleTemplateConfirmation = noop,
} ) => {
	if ( isEmpty( templates ) || ! isArray( templates ) ) {
		return null;
	}

	if ( true === useDynamicPreview && isEmpty( blocksByTemplates ) ) {
		return null;
	}

	const id = `template-selector-${ instanceId }`;

	return (
		<div
			label={ label }
			id={ id }
			help={ help }
			className={ classnames( className, 'template-selector' ) }
		>
			<ul className="template-selector__options" data-testid="template-selector-options">
				{ map( templates, ( { slug, title, preview, previewAlt } ) => (
					<li key={ `${ id }-${ slug }` } className="template-selector__template">
						<TemplateSelectorItem
							id={ id }
							value={ slug }
							label={ replacePlaceholders( title, siteInformation ) }
							help={ help }
							onSelect={ onTemplateSelect }
							staticPreviewImg={ preview }
							staticPreviewImgAlt={ previewAlt }
							blocks={ blocksByTemplates.hasOwnProperty( slug ) ? blocksByTemplates[ slug ] : [] }
							useDynamicPreview={ useDynamicPreview }
							isSelected={ slug === selectedTemplate }
							handleTemplateConfirmation={ handleTemplateConfirmation }
						/>
					</li>
				) ) }
			</ul>
		</div>
	);
};

//export default compose( memo, withInstanceId )( TemplateSelector );
export default TemplateSelector;
