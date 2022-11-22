import { PatternsRenderer } from '@automattic/blocks-renderer';
import classnames from 'classnames';
import { encodePatternId, handleKeyboard } from './utils';
import type { Pattern } from './types';

interface Props {
	patterns: Pattern[];
	selectedPattern: Pattern | null;
	show: boolean;
	onSelect: ( selectedPattern: Pattern | null ) => void;
}

const PatternListRenderer = ( { patterns, selectedPattern, show, onSelect }: Props ) => {
	return (
		<div className="pattern-selector__block-list" role="listbox">
			{ patterns.map( ( pattern ) => (
				<div
					key={ pattern.id }
					aria-label={ pattern.name }
					tabIndex={ show ? 0 : -1 }
					role="option"
					title={ pattern.name }
					aria-selected={ pattern.id === selectedPattern?.id }
					className={ classnames( 'pattern-selector__block-list-item', {
						'pattern-selector__block-list-item--selected-pattern':
							pattern.id === selectedPattern?.id,
					} ) }
					onClick={ () => onSelect( pattern ) }
					onKeyUp={ handleKeyboard( () => onSelect( pattern ) ) }
				>
					<PatternsRenderer patternIds={ [ encodePatternId( pattern.id ) ] } />
				</div>
			) ) }
		</div>
	);
};

export default PatternListRenderer;
