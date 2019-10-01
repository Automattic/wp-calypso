/**
 * External dependencies
 */
/* eslint-disable import/no-extraneous-dependencies */
import { isEmpty, isArray, noop, map, get } from 'lodash';
/* eslint-enable import/no-extraneous-dependencies */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
/* eslint-disable import/no-extraneous-dependencies */
import { withInstanceId, compose } from '@wordpress/compose';
import { BaseControl } from '@wordpress/components';
import { memo } from '@wordpress/element';
/* eslint-enable import/no-extraneous-dependencies */

/**
 * Internal dependencies
 */
import TemplateSelectorItem from './template-selector-item';
import replacePlaceholders from '../utils/replace-placeholders';
import { getTemplateBySlug, hasTemplates } from '../utils/templates-parser';

export const TemplateSelectorControl = ( {
	label,
	className,
	help,
	instanceId,
	templates = [],
	useDynamicPreview = false,
	onTemplateSelect = noop,
	siteInformation = {},
	selectedTemplate,
	handleTemplateConfirmation = noop,
} ) => {
	if ( isEmpty( templates ) || ! isArray( templates ) ) {
		return null;
	}

	if ( true === useDynamicPreview && ! hasTemplates() ) {
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
			<ul
				className="template-selector-control__options"
				data-testid="template-selector-control-options"
			>
				{ map( templates, ( { slug, title, preview, previewAlt } ) => (
					<li key={ `${ id }-${ slug }` } className="template-selector-control__template">
						<TemplateSelectorItem
							id={ id }
							value={ slug }
							label={ replacePlaceholders( title, siteInformation ) }
							help={ help }
							onSelect={ onTemplateSelect }
							staticPreviewImg={ preview }
							staticPreviewImgAlt={ previewAlt }
							useDynamicPreview={ useDynamicPreview }
							isSelected={ slug === selectedTemplate }
							handleTemplateConfirmation={ handleTemplateConfirmation }
							isParsing={ get( blocksByTemplates, [ slug, 'isParsing' ], false ) }
							template={ getTemplateBySlug( slug ) }
						/>
					</li>
				) ) }
			</ul>
		</BaseControl>
	);
};

export default compose(
	memo,
	withInstanceId
)( TemplateSelectorControl );
