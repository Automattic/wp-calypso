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
	const { __ } = useI18n();
	const { data: patterns } = useQueryPatterns( PATTERN_SOURCE_SITE_SLUG );
	const [ offsetX, setOffsetX ] = React.useState( 0 );
	const [ dragStartX, setDragStartX ] = React.useState( 0 );
	const [ scrollTicks, setScrollTicks ] = React.useState( 0 );

	useEffect( () => {
		if ( currentRef ) {
			const itemWidth = width( currentRef?.firstChild as HTMLDivElement );
			const itemWidthWithGap = itemWidth + 20;
			const offsetX = itemWidth / 2 + itemWidthWithGap * index;
			if ( currentRef.scrollLeft !== offsetX ) {
				setOffsetX( -offsetX );
			}
		}
	}, [ index, currentRef ] );

	if ( ! patterns ) {
		return null;
	}

	const onWheel = ( event: React.WheelEvent< HTMLDivElement > ) => {
		const { deltaY } = event;
		// consider every 4 ticks as a single scroll
		if ( scrollTicks % 4 === 0 && Math.abs( deltaY ) > 2 ) {
			if ( event.deltaY < 1 ) {
				if ( index > 0 ) {
					setIndex( index - 1 );
				}
			} else if ( event.deltaY > 1 && index < patterns.length - 1 ) {
				setIndex( ( index + 1 ) % 400 );
			}
		}
		setScrollTicks( ( ticks ) => ticks + 1 );
	};

	const onSwipe = ( event: React.TouchEvent< HTMLDivElement > ) => {
		const currentX = event.changedTouches[ 0 ].clientX;
		const traveledX = currentX - dragStartX;
		// detect swipes
		if ( Math.abs( traveledX ) > 50 ) {
			if ( traveledX < 0 ) {
				if ( index < patterns.length - 1 ) {
					setIndex( index + 1 );
				}
			} else if ( index > 0 ) {
				setIndex( index - 1 );
			}
		}
	};

	return (
		<div
			className="pattern-picker"
			onTouchStart={ ( event ) => setDragStartX( event.touches[ 0 ].clientX ) }
			onScroll={ onWheel }
			onTouchEnd={ onSwipe }
			onWheel={ onWheel }
		>
			<div
				ref={ ( ref ) => ref && ref !== currentRef && setRef( ref ) }
				className="pattern-picker__carousel"
			>
				{ patterns.map( ( pattern, i ) => (
					<Item
						className={ classNames( { 'is-active': index === i } ) }
						key={ pattern.ID }
						onClick={ () => {
							setIndex( i );
						} }
						pattern={ pattern }
						style={ { transform: `translateX(${ offsetX }px)` } }
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
