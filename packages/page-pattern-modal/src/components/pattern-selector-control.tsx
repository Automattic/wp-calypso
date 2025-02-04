// @ts-expect-error Missing definition
import { __experimentalBlockPatternsList as BlockPatternsList } from '@wordpress/block-editor';
import { BaseControl } from '@wordpress/components';
import { withInstanceId } from '@wordpress/compose';
import { memo } from '@wordpress/element';
import type { FormattedPattern } from '../pattern-definition';

const noop = () => undefined;

interface PatternSelectorControlProps {
	instanceId: string | number;
	label: string;
	onPatternSelect: ( patternName: string ) => void;
	patterns?: FormattedPattern[];
}

export const PatternSelectorControl = ( {
	instanceId,
	label,
	patterns = [],
	onPatternSelect = noop,
}: PatternSelectorControlProps ) => {
	if ( ! Array.isArray( patterns ) || ! patterns.length ) {
		return null;
	}

	return (
		<BaseControl
			id={ `pattern-selector-control__${ instanceId }` }
			label={ label }
			className="pattern-selector-control"
		>
			<BlockPatternsList
				blockPatterns={ patterns }
				onClickPattern={ ( pattern: FormattedPattern ) => onPatternSelect( pattern.name ) }
			/>
		</BaseControl>
	);
};

export default memo( withInstanceId( PatternSelectorControl ) );
