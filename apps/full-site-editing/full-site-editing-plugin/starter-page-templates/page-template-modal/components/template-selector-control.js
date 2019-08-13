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

/**
 * Internal dependencies
 */
import TemplateSelectorItem from './template-selector-item';
import replacePlaceholders from '../utils/replace-placeholders';

// Load config passed from backend.
const { siteInformation = {} } = window.starterPageTemplatesConfig;

function TemplateSelectorControl( {
	label,
	className,
	help,
	instanceId,
	onTemplateSelect = noop,
	onTemplateFocus = noop,
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
							onFocus={ onTemplateFocus }
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
