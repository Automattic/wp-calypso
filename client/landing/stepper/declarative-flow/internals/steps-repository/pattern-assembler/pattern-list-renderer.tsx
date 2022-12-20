import { PatternsRenderer } from '@automattic/block-renderer';
import { Button } from '@automattic/components';
import classnames from 'classnames';
import { encodePatternId } from './utils';
import type { Pattern } from './types';
import './pattern-list-renderer.scss';

interface Props {
	patterns: Pattern[];
	selectedPattern: Pattern | null;
	show: boolean;
	activeClassName: string;
	onSelect: ( selectedPattern: Pattern | null ) => void;
}

const PatternListRenderer = ( {
	patterns,
	selectedPattern,
	show,
	activeClassName,
	onSelect,
}: Props ) => {
	return (
		<>
			{ patterns.map( ( pattern, index ) => (
				<Button
					key={ `${ index }-${ pattern.id }` }
					tabIndex={ show ? 0 : -1 }
					title={ pattern.category }
					className={ classnames( 'pattern-list-renderer__pattern', {
						[ activeClassName ]: pattern.id === selectedPattern?.id,
					} ) }
					onClick={ () => onSelect( pattern ) }
				>
					<PatternsRenderer
						patternIds={ [ encodePatternId( pattern.id ) ] }
						viewportWidth={ 1060 }
					/>
				</Button>
			) ) }
		</>
	);
};

export default PatternListRenderer;
