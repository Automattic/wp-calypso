/**
 * WordPress dependencies
 */
import { BaseControl } from '@wordpress/components';
import { memo } from '@wordpress/element';
import { withInstanceId } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import TemplateSelectorItem from './template-selector-item';
import replacePlaceholders from '../utils/replace-placeholders';
import type { LayoutDefinition } from '../layout-definition';

const noop = () => undefined;

interface TemplateSelectorControlProps {
	instanceId: number;
	label: string;
	legendLabel?: string;
	locale?: string;
	onTemplateSelect: ( templateName: string ) => void;
	siteInformation?: Record< string, string >;
	templates?: LayoutDefinition[];
	theme?: string;
}

export const TemplateSelectorControl = ( {
	instanceId,
	label,
	legendLabel,
	templates = [],
	theme = 'maywood',
	locale = 'en',
	onTemplateSelect = noop,
	siteInformation = {},
}: TemplateSelectorControlProps ): JSX.Element | null => {
	if ( ! Array.isArray( templates ) || ! templates.length ) {
		return null;
	}

	return (
		<BaseControl
			id={ `template-selector-control__${ instanceId }` }
			label={ label }
			className="template-selector-control"
		>
			<ul
				className="template-selector-control__options"
				data-testid="template-selector-control-options"
				aria-label={ legendLabel }
			>
				{ templates.map( ( { ID, name, title, description } ) => (
					<li
						key={ `${ ID }-${ name }-${ legendLabel }` }
						className="template-selector-control__template"
					>
						<TemplateSelectorItem
							value={ name }
							title={ replacePlaceholders( title, siteInformation ) }
							description={ description }
							onSelect={ onTemplateSelect }
							templatePostID={ ID }
							theme={ theme }
							locale={ locale }
						/>
					</li>
				) ) }
			</ul>
		</BaseControl>
	);
};

export default memo( withInstanceId( TemplateSelectorControl ) );
