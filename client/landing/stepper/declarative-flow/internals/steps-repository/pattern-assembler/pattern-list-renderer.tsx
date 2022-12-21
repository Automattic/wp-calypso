import { Button } from '@automattic/components';
import classnames from 'classnames';
import { encodePatternId } from './utils';
import type { Pattern } from './types';

interface Props {
	patterns: Pattern[];
	selectedPattern: Pattern | null;
	show: boolean;
	onSelect: ( selectedPattern: Pattern | null ) => void;
}

const PatternListRenderer = ( { patterns, selectedPattern, show, onSelect }: Props ) => {
	return (
		<>
			{ patterns.map( ( pattern, index ) => (
				<Button
					key={ `${ index }-${ pattern.id }` }
					tabIndex={ show ? 0 : -1 }
					title={ pattern.category }
					className={ classnames( {
						'pattern-selector__block-list--selected-pattern': pattern.id === selectedPattern?.id,
					} ) }
					onClick={ () => onSelect( pattern ) }
				>
					{ /* TODO: render pattern */ }
					{ encodePatternId( pattern.id ) }
				</Button>
			) ) }
		</>
	);
};

export default PatternListRenderer;
