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

function within( value: number, min: number, max: number ) {
	return Math.min( Math.max( value, min ), max );
}

type Props = { onPick: ( pattern: Pattern ) => void };

export function PatternPicker( { onPick }: Props ) {
	const [ index, setIndex ] = React.useState( 0 );
	/**
	 * Interim index is the index of the element in focus during dragging only.
	 */
	const [ interimIndex, setInterimIndex ] = React.useState( 0 );
	const [ containerRef, setRef ] = React.useState< HTMLDivElement >();
	const { __ } = useI18n();
	const { data: patterns } = useQueryPatterns( PATTERN_SOURCE_SITE_SLUG );
	const [ offsetX, setOffsetX ] = React.useState( 0 );
	const [ dragStartX, setDragStartX ] = React.useState( 0 );
	const [ touchOffset, setTouchOffset ] = React.useState( 0 );
	const [ windowSizeChanges, setWindowSizeChanges ] = React.useState( 0 );

	useEffect( () => {
		const handleResize = () => {
			setWindowSizeChanges( ( c ) => c + ( 1 % 100 ) );
		};

		function handleArrows( event: KeyboardEvent ) {
			if ( patterns ) {
				if ( event.key === 'ArrowLeft' ) {
					setIndex( within( index - 1, 0, patterns.length - 1 ) );
				} else if ( event.key === 'ArrowRight' ) {
					setIndex( within( index + 1, 0, patterns.length - 1 ) );
				}
			}
		}

		window.addEventListener( 'resize', handleResize );
		window.addEventListener( 'keydown', handleArrows );
		return () => {
			window.removeEventListener( 'resize', handleResize );
			window.removeEventListener( 'keydown', handleArrows );
		};
	}, [ setIndex, index, patterns ] );

	useEffect( () => {
		if ( containerRef ) {
			const itemWidth = width( containerRef?.firstChild as HTMLDivElement );
			const itemWidthWithGap = itemWidth + 20;
			const offsetX = itemWidth / 2 + itemWidthWithGap * index;
			setOffsetX( -offsetX );
		}
	}, [ index, containerRef, windowSizeChanges ] );

	if ( ! patterns ) {
		return null;
	}

	/*
	keep for future improvement
	const onWheel = ( event: React.WheelEvent< HTMLDivElement > ) => {
		const { deltaX } = event;
		const newTicks = scrollOffset + deltaX;
		const itemWidth = width( event.currentTarget.firstChild as HTMLDivElement );
		const itemWidthWithGap = itemWidth + 20;
		const newIndex = Math.round( newTicks / itemWidthWithGap );
		setIndex( within( newIndex, 0, patterns.length - 1 ) );
		// to avoid buffering scrolling ticks beyond the limits, forcing the user to unscroll their way back
		setScrollOffset( within( newTicks, 0, ( patterns.length - 1 ) * itemWidthWithGap ) );
	};
	*/

	const onTouchEnd = ( event: React.TouchEvent< HTMLDivElement > ) => {
		const currentX = event.changedTouches[ 0 ].clientX;
		const traveledX = currentX - dragStartX;
		const itemWidth = width( event.currentTarget.firstChild as HTMLDivElement );
		const itemWidthWithGap = itemWidth + 20;
		const indicesTraveled = -Math.round( traveledX / itemWidthWithGap );
		const newIndex = index + indicesTraveled;
		setIndex( within( newIndex, 0, patterns.length - 1 ) );
		setInterimIndex( -1 );
		setTouchOffset( 0 );
	};

	const onTouchMove = ( event: React.TouchEvent< HTMLDivElement > ) => {
		const currentX = event.changedTouches[ 0 ].clientX;
		setTouchOffset( currentX - dragStartX );
		const traveledX = currentX - dragStartX;
		const itemWidth = width( event.currentTarget.firstChild as HTMLDivElement );
		const itemWidthWithGap = itemWidth + 20;
		const indicesTraveled = -Math.round( traveledX / itemWidthWithGap );
		const newIndex = index + indicesTraveled;
		setInterimIndex( within( newIndex, 0, patterns.length - 1 ) );
	};

	return (
		<div className="pattern-picker" onTouchMove={ ( e ) => e.preventDefault() }>
			<div
				ref={ ( ref ) => ref && ref !== containerRef && setRef( ref ) }
				className={ classNames( 'pattern-picker__carousel', {
					'is-dragging': touchOffset !== 0,
				} ) }
				onTouchStart={ ( event ) => setDragStartX( event.touches[ 0 ].clientX ) }
				onTouchEnd={ onTouchEnd }
				onTouchMove={ onTouchMove }
			>
				{ patterns.map( ( pattern, i ) => (
					<Item
						className={ classNames( { 'is-active': index === i || interimIndex === i } ) }
						key={ pattern.ID }
						onClick={ () => {
							setIndex( i );
						} }
						pattern={ pattern }
						style={ { transform: `translateX(${ offsetX + touchOffset }px)` } }
					/>
				) ) }
			</div>
			<div className="pattern-picker__controls">
				<button
					className={ classNames(
						'pattern-picker__carousel-nav-button pattern-picker__carousel-nav-button--back',
						{ 'is-hidden': index < 1 }
					) }
					onClick={ () => setIndex( index - 1 ) }
				>
					<Icon icon={ chevronLeft } />
				</button>
				<button
					className={ classNames(
						'pattern-picker__carousel-nav-button pattern-picker__carousel-nav-button--next',
						{ 'is-hidden': index >= patterns.length - 1 }
					) }
					onClick={ () => setIndex( index + 1 ) }
				>
					<Icon icon={ chevronRight } />
				</button>
			</div>
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
