/**
 * External dependencies
 */
import { isEmpty, isArray, noop, map } from 'lodash';
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
import replacePlaceholders from '../utils/replace-placeholders';

export const TemplateSelectorControl = ( {
	label,
	legendLabel,
	className,
	help,
	instanceId,
	templates = [],
	blocksByTemplates = {},
	theme = 'maywood',
	locale = 'en',
	onTemplateSelect = noop,
	siteInformation = {},
	selectedTemplate,
} ) => {
	if ( isEmpty( templates ) || ! isArray( templates ) ) {
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
				aria-label={ legendLabel }
			>
				{ map( templates, ( { ID, name, title, description } ) => (
					<li key={ `${ id }-${ name }` } className="template-selector-control__template">
						<TemplateSelectorItem
							id={ id }
							value={ name }
							title={ replacePlaceholders( title, siteInformation ) }
							description={ description }
							help={ help }
							onSelect={ onTemplateSelect }
							templatePostID={ ID }
							theme={ theme }
							locale={ locale }
							blocks={ blocksByTemplates.hasOwnProperty( name ) ? blocksByTemplates[ name ] : [] }
							isSelected={ name === selectedTemplate }
						/>
					</li>
				) ) }
			</ul>
		</BaseControl>
	);
};

export default compose( memo, withInstanceId )( TemplateSelectorControl );
