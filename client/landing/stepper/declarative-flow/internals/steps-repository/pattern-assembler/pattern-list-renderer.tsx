import { PatternRenderer } from '@automattic/blocks-renderer';
import classnames from 'classnames';
import { useSite } from '../../../../hooks/use-site';
import { encodePatternId, handleKeyboard } from './utils';
import type { Pattern } from './types';

interface Props {
	stylesheet: string;
	patterns: Pattern[];
	selectedPattern: Pattern | null;
	show: boolean;
	onSelect: ( selectedPattern: Pattern | null ) => void;
}

const PatternListRenderer = ( {
	stylesheet,
	patterns,
	selectedPattern,
	show,
	onSelect,
}: Props ) => {
	const site = useSite();

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
					<PatternRenderer
						siteId={ site?.ID }
						patternId={ encodePatternId( pattern.id ) }
						stylesheet={ stylesheet }
					/>
				</div>
			) ) }
		</div>
	);
};

export default PatternListRenderer;
