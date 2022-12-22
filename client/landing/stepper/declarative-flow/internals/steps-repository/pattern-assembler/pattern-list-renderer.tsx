import { PatternsRenderer } from '@automattic/block-renderer';
import { Button } from '@automattic/components';
import classnames from 'classnames';
import { useMemo } from 'react';
import { encodePatternId } from './utils';
import type { Pattern } from './types';
import './pattern-list-renderer.scss';

interface PatternListItemProps {
	pattern: Pattern;
	className: string;
	show: boolean;
	onSelect: ( selectedPattern: Pattern | null ) => void;
}

interface PatternListRendererProps {
	patterns: Pattern[];
	selectedPattern: Pattern | null;
	show: boolean;
	activeClassName: string;
	onSelect: ( selectedPattern: Pattern | null ) => void;
}

const PatternListItem = ( { pattern, className, show, onSelect }: PatternListItemProps ) => {
	const patternIds = useMemo( () => [ encodePatternId( pattern.id ) ], [ pattern.id ] );

	return (
		<Button
			className={ className }
			title={ pattern.category }
			tabIndex={ show ? 0 : -1 }
			onClick={ () => onSelect( pattern ) }
		>
			<PatternsRenderer patternIds={ patternIds } viewportWidth={ 1060 } />
		</Button>
	);
};

const PatternListRenderer = ( {
	patterns,
	selectedPattern,
	show,
	activeClassName,
	onSelect,
}: PatternListRendererProps ) => {
	return (
		<>
			{ patterns.map( ( pattern, index ) => (
				<PatternListItem
					key={ `${ index }-${ pattern.id }` }
					pattern={ pattern }
					show={ show }
					className={ classnames( 'pattern-list-renderer__pattern-list-item', {
						[ activeClassName ]: pattern.id === selectedPattern?.id,
					} ) }
					onSelect={ onSelect }
				/>
			) ) }
		</>
	);
};

export default PatternListRenderer;
