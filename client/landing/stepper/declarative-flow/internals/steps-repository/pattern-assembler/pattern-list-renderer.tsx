import { PatternRenderer } from '@automattic/block-renderer';
import { Tooltip, __unstableCompositeItem as CompositeItem } from '@wordpress/components';
import classnames from 'classnames';
import { useEffect, useCallback, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { encodePatternId, isPriorityPattern } from './utils';
import type { Pattern } from './types';
import './pattern-list-renderer.scss';

interface PatternListItemProps {
	pattern: Pattern;
	className: string;
	isFirst: boolean;
	isShown: boolean;
	isSelected?: boolean;
	composite?: Record< string, unknown >;
	onSelect: ( selectedPattern: Pattern | null ) => void;
	isNewSite: boolean;
}

interface PatternListRendererProps {
	patterns: Pattern[];
	shownPatterns: Pattern[];
	selectedPattern: Pattern | null;
	selectedPatterns?: Pattern[];
	activeClassName: string;
	composite?: Record< string, unknown >;
	onSelect: ( selectedPattern: Pattern | null ) => void;
	isShowMorePatterns?: boolean;
	isNewSite: boolean;
}

const DEFAULT_VIEWPORT_WIDTH = 1060;
const DEFAULT_VIEWPORT_HEIGHT = 500;
const PLACEHOLDER_HEIGHT = 100;

const PatternListItem = ( {
	pattern,
	className,
	isFirst,
	isShown,
	isSelected,
	composite,
	onSelect,
	isNewSite,
}: PatternListItemProps ) => {
	const ref = useRef< HTMLButtonElement >();
	const { ref: inViewRef, inView: inViewOnce } = useInView( {
		triggerOnce: true,
	} );

	const setRefs = useCallback(
		( node?: Element | null | undefined ) => {
			if ( node ) {
				ref.current = node as HTMLButtonElement;
				inViewRef( node );
			}
		},
		[ inViewRef ]
	);

	useEffect( () => {
		if ( isShown && isFirst && ref.current ) {
			ref.current.focus();
		}
	}, [ isShown, isFirst, ref ] );

	return (
		<Tooltip text={ pattern.title }>
			<CompositeItem
				{ ...composite }
				role="option"
				as="button"
				className={ className }
				ref={ setRefs }
				aria-label={ pattern.title }
				aria-describedby={ pattern.description }
				aria-current={ isSelected }
				onClick={ () => onSelect( pattern ) }
			>
				{ isShown && inViewOnce ? (
					<PatternRenderer
						key={ pattern.ID }
						patternId={ encodePatternId( pattern.ID ) }
						viewportWidth={ DEFAULT_VIEWPORT_WIDTH }
						viewportHeight={ DEFAULT_VIEWPORT_HEIGHT }
						minHeight={ PLACEHOLDER_HEIGHT }
						shouldShufflePosts={ isNewSite }
					/>
				) : (
					<div key={ pattern.ID } style={ { height: PLACEHOLDER_HEIGHT } } />
				) }
			</CompositeItem>
		</Tooltip>
	);
};

const PatternListRenderer = ( {
	patterns,
	shownPatterns,
	selectedPattern,
	selectedPatterns,
	activeClassName,
	composite,
	onSelect,
	isShowMorePatterns,
	isNewSite,
}: PatternListRendererProps ) => {
	const filterPriorityPatterns = ( pattern: Pattern ) =>
		isShowMorePatterns || isPriorityPattern( pattern );

	return (
		<>
			{ patterns?.filter( filterPriorityPatterns ).map( ( pattern, index ) => (
				<PatternListItem
					key={ `${ index }-${ pattern.ID }` }
					pattern={ pattern }
					className={ classnames( 'pattern-list-renderer__pattern-list-item', {
						[ activeClassName ]:
							pattern.ID === selectedPattern?.ID ||
							selectedPatterns?.find( ( { ID } ) => ID === pattern.ID ),
					} ) }
					isFirst={ index === 0 }
					isShown={ shownPatterns.includes( pattern ) }
					isSelected={ pattern.ID === selectedPattern?.ID }
					composite={ composite }
					onSelect={ onSelect }
					isNewSite={ isNewSite }
				/>
			) ) }
		</>
	);
};

export default PatternListRenderer;
