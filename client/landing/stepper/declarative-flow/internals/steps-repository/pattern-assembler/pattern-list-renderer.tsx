import { PatternRenderer } from '@automattic/block-renderer';
import { Button } from '@automattic/components';
import classnames from 'classnames';
import { encodePatternId } from './utils';
import type { Pattern } from './types';
import './pattern-list-renderer.scss';

interface PatternListItemProps {
	pattern: Pattern;
	className: string;
	onSelect: ( selectedPattern: Pattern | null ) => void;
}

interface PatternListRendererProps {
	patterns: Pattern[];
	shownPatterns: Pattern[];
	selectedPattern: Pattern | null;
	activeClassName: string;
	onSelect: ( selectedPattern: Pattern | null ) => void;
}

const PLACEHOLDER_HEIGHT = 100;
const MAX_HEIGHT_FOR_100VH = 500;

const PatternListItem = ( { pattern, className, onSelect }: PatternListItemProps ) => {
	return (
		<Button
			className={ className }
			title={ pattern.category }
			onClick={ () => onSelect( pattern ) }
		>
			<PatternRenderer
				patternId={ encodePatternId( pattern.id ) }
				viewportWidth={ 1060 }
				minHeight={ PLACEHOLDER_HEIGHT }
				maxHeightFor100vh={ MAX_HEIGHT_FOR_100VH }
			/>
		</Button>
	);
};

const PatternListRenderer = ( {
	patterns,
	shownPatterns,
	selectedPattern,
	activeClassName,
	onSelect,
}: PatternListRendererProps ) => {
	return (
		<>
			{ patterns.map( ( pattern, index ) => {
				const isShown = shownPatterns.includes( pattern );

				return isShown ? (
					<PatternListItem
						key={ `${ index }-${ pattern.id }` }
						pattern={ pattern }
						className={ classnames( 'pattern-list-renderer__pattern-list-item', {
							[ activeClassName ]: pattern.id === selectedPattern?.id,
						} ) }
						onSelect={ onSelect }
					/>
				) : null;
			} ) }
		</>
	);
};

export default PatternListRenderer;
