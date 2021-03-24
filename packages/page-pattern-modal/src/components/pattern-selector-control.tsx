/**
 * WordPress dependencies
 */
import { BaseControl } from '@wordpress/components';
import { memo } from '@wordpress/element';

/**
 * Internal dependencies
 */
import PatternSelectorItem from './pattern-selector-item';
import replacePlaceholders from '../utils/replace-placeholders';
import { withInstanceId } from '@wordpress/compose';
import type { PatternDefinition } from '../pattern-definition';

const noop = () => undefined;

interface PatternSelectorControlProps {
	instanceId: number;
	label: string;
	legendLabel?: string;
	locale?: string;
	onPatternSelect: ( patternName: string ) => void;
	siteInformation?: Record< string, string >;
	patterns?: PatternDefinition[];
	theme?: string;
}

export const PatternSelectorControl = ( {
	instanceId,
	label,
	legendLabel,
	patterns = [],
	theme = 'maywood',
	locale = 'en',
	onPatternSelect = noop,
	siteInformation = {},
}: PatternSelectorControlProps ): JSX.Element | null => {
	if ( ! Array.isArray( patterns ) || ! patterns.length ) {
		return null;
	}

	return (
		<BaseControl
			id={ `pattern-selector-control__${ instanceId }` }
			label={ label }
			className="pattern-selector-control"
		>
			<ul
				className="pattern-selector-control__options"
				data-testid="pattern-selector-control-options"
				aria-label={ legendLabel }
			>
				{ patterns.map( ( { ID, name, title, description } ) => (
					<li key={ `${ ID }-${ name }-${ legendLabel }` }>
						<PatternSelectorItem
							value={ name }
							title={ replacePlaceholders( title, siteInformation ) }
							description={ description }
							onSelect={ onPatternSelect }
							patternPostID={ ID }
							theme={ theme }
							locale={ locale }
						/>
					</li>
				) ) }
			</ul>
		</BaseControl>
	);
};

export default memo( withInstanceId( PatternSelectorControl ) );
