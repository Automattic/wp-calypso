/**
 * External dependencies
 */
/* eslint-disable import/no-extraneous-dependencies */
import { isEmpty, isArray, noop, map } from 'lodash';
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

/**
 * @typedef Props
 *
 * @property {import('react').ReactNode} [label]
 * @property {string} [className]
 * @property {import('react').ReactNode} [help]
 * @property {string} instanceId
 * @property {any[]} [templates=[]]
 * @property {{[templateSlug: string]: any}} [blocksByTemplates={}]
 * @property {boolean} [useDynamicPreview=false]
 * @property {(templateSlug: string) => void} [onTemplateSelect=noop] Callback receives template slug when called
 * @property {{[key: string]: any}} [siteInformation={}] TODO: Better type
 * @property {string|undefined} selectedTemplate The selected template slug
 */

/**
 * Template selector control component
 *
 * @param {Props} _ Component props
 */
export const TemplateSelectorControl = ( {
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
} ) => {
	if ( isEmpty( templates ) || ! isArray( templates ) ) {
		return null;
	}

	if ( true === useDynamicPreview && isEmpty( blocksByTemplates ) ) {
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
							blocks={ blocksByTemplates.hasOwnProperty( slug ) ? blocksByTemplates[ slug ] : [] }
							useDynamicPreview={ useDynamicPreview }
							isSelected={ slug === selectedTemplate }
						/>
					</li>
				) ) }
			</ul>
		</BaseControl>
	);
};

export default compose( memo, withInstanceId )( TemplateSelectorControl );
