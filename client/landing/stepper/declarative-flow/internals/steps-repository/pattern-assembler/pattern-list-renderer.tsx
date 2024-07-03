import { PatternRenderer } from '@automattic/block-renderer';
import { Tooltip, __unstableCompositeItem as CompositeItem } from '@wordpress/components';
import clsx from 'clsx';
import { useEffect, useCallback, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { DEFAULT_VIEWPORT_WIDTH, DEFAULT_VIEWPORT_HEIGHT, PLACEHOLDER_HEIGHT } from './constants';
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
	transformPatternHtml?: ( patternHtml: string ) => string;
	onSelect: ( selectedPattern: Pattern | null ) => void;
}

interface PatternListRendererProps {
	patterns: Pattern[];
	shownPatterns: Pattern[];
	selectedPattern: Pattern | null;
	selectedPatterns?: Pattern[];
	activeClassName: string;
	composite?: Record< string, unknown >;
	transformPatternHtml?: ( patternHtml: string ) => string;
	onSelect: ( selectedPattern: Pattern | null ) => void;
	isShowMorePatterns?: boolean;
}

const PatternListItem = ( {
	pattern,
	className,
	isFirst,
	isShown,
	isSelected,
	composite,
	transformPatternHtml,
	onSelect,
}: PatternListItemProps ) => {
	const ref = useRef< HTMLButtonElement >();
	const { ref: inViewRef } = useInView( {
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
				{ isShown ? (
					<PatternRenderer
						key={ pattern.ID }
						patternId={ encodePatternId( pattern.ID ) }
						viewportWidth={ DEFAULT_VIEWPORT_WIDTH }
						viewportHeight={ DEFAULT_VIEWPORT_HEIGHT }
						minHeight={ PLACEHOLDER_HEIGHT }
						transformHtml={ transformPatternHtml }
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
	transformPatternHtml,
	onSelect,
	isShowMorePatterns,
}: PatternListRendererProps ) => {
	const filterPriorityPatterns = ( pattern: Pattern ) =>
		isShowMorePatterns || isPriorityPattern( pattern );

	return (
		<>
			{ patterns?.filter( filterPriorityPatterns ).map( ( pattern, index ) => (
				<PatternListItem
					key={ `${ index }-${ pattern.ID }` }
					pattern={ pattern }
					className={ clsx( 'pattern-list-renderer__pattern-list-item', {
						[ activeClassName ]:
							pattern.ID === selectedPattern?.ID ||
							selectedPatterns?.find( ( { ID } ) => ID === pattern.ID ),
					} ) }
					isFirst={ index === 0 }
					isShown={ shownPatterns.includes( pattern ) }
					isSelected={ pattern.ID === selectedPattern?.ID }
					composite={ composite }
					transformPatternHtml={ transformPatternHtml }
					onSelect={ onSelect }
				/>
			) ) }
		</>
	);
};

export default PatternListRenderer;
