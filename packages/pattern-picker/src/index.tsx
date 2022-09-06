/* eslint-disable wpcalypso/jsx-classname-namespace */
import { Gridicon } from '@automattic/components';
import { Button } from '@wordpress/components';
import { Icon, chevronLeft, chevronRight } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import classNames from 'classnames';
import React, { useEffect } from 'react';
import { PATTERN_SOURCE_SITE_SLUG } from './constants';
import { Item } from './item';
import useQueryPatterns from './use-query-patterns';
import type { Pattern } from './types';

function width( el: HTMLDivElement | null ) {
	return Math.floor( el?.getBoundingClientRect().width ?? 1 );
}

type Props = { onPick: ( pattern: Pattern ) => void };

export function PatternPicker( { onPick }: Props ) {
	const [ index, setIndex ] = React.useState( 0 );
	const [ currentRef, setRef ] = React.useState< HTMLDivElement >();
	const [ timeoutRef, setTimeoutRef ] = React.useState( 0 );
	const { __ } = useI18n();
	const { data: patterns } = useQueryPatterns( PATTERN_SOURCE_SITE_SLUG );

	useEffect( () => {
		if ( currentRef ) {
			const itemWidth = width( currentRef?.firstChild as HTMLDivElement );
			const itemWidthWithGap = itemWidth + 20;
			const scrollLeft = itemWidth / 2 + itemWidthWithGap * index;
			if ( currentRef.scrollLeft !== scrollLeft ) {
				currentRef.scrollLeft = scrollLeft;
			}
		}
	}, [ index, currentRef ] );

	function onScroll( event: React.UIEvent< HTMLDivElement > ) {
		const { currentTarget } = event;
		clearTimeout( timeoutRef );
		// we're only interested in this event after snapping animation is done
		setTimeoutRef(
			setTimeout( () => {
				if ( timeoutRef ) {
					const itemWidth = width( currentTarget.firstChild as HTMLDivElement );
					const itemWidthWithGap = itemWidth + 20;
					const scrollLeft = currentTarget.scrollLeft;
					const index = Math.floor( ( scrollLeft - itemWidth / 2 ) / itemWidthWithGap );
					setIndex( index );
					setTimeoutRef( 0 );
				}
			}, 100 )
		);
	}

	if ( ! patterns ) {
		return null;
	}

	return (
		<div className="pattern-picker">
			<div
				ref={ ( ref ) => ref && ref !== currentRef && setRef( ref ) }
				className="pattern-picker__carousel"
				onScroll={ onScroll }
			>
				{ patterns.map( ( pattern, i ) => (
					<Item
						className={ classNames( { 'is-active': index === i } ) }
						key={ pattern.ID }
						onClick={ () => {
							setIndex( i );
						} }
						pattern={ pattern }
					/>
				) ) }
			</div>
			{ index > 0 && (
				<button
					className="pattern-picker__carousel-nav-button pattern-picker__carousel-nav-button--back"
					onClick={ () => setIndex( index - 1 ) }
				>
					<Icon icon={ chevronLeft } />
				</button>
			) }
			{ index < patterns.length - 1 && (
				<button
					className="pattern-picker__carousel-nav-button pattern-picker__carousel-nav-button--next"
					onClick={ () => setIndex( index + 1 ) }
				>
					<Icon icon={ chevronRight } />
				</button>
			) }
			<div className="pattern-picker__cta">
				<Button
					className="pattern-picker__select"
					isPrimary
					onClick={ () => onPick( patterns[ index ] ) }
				>
					<span>{ __( 'Continue' ) }</span>
					<Gridicon icon="heart" size={ 18 } />
				</Button>
			</div>
		</div>
	);
}

export type { Pattern };
