/**
 * External dependencies
 */
import { isEmpty, noop, map } from 'lodash';
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { withInstanceId, compose } from '@wordpress/compose';
import { BaseControl } from '@wordpress/components';
import { memo } from '@wordpress/element';

/**
 * Internal dependencies
 */
import TemplateSelectorItem from './template-selector-item';

// Load config passed from backend.
const { siteInformation = {} } = window.starterPageTemplatesConfig;

const TemplateSelectorControl = ( {
	label,
	className,
	help,
	instanceId,
	templates = {},
	blocksByTemplates = {},
	useDynamicPreview = false,
	numBlocksInPreview,
	onTemplateSelect = noop,
	onTemplateFocus = noop,
} ) => {
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
				{ map( templates, ( { slug, title, preview, previewAlt, value } ) => (
					<li key={ `${ id }-${ value }` } className="template-selector-control__template">
						<TemplateSelectorItem
							id={ id }
							value={ slug }
							label={ title }
							help={ help }
							onSelect={ onTemplateSelect }
							onFocus={ onTemplateFocus }
							staticPreviewImg={ preview }
							staticPreviewImgAlt={ previewAlt }
							blocks={ blocksByTemplates[ slug ] }
							useDynamicPreview={ useDynamicPreview }
							numBlocksInPreview={ numBlocksInPreview }
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
