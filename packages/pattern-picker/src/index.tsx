/* eslint-disable wpcalypso/jsx-classname-namespace */
import { Gridicon } from '@automattic/components';
import { Button } from '@wordpress/components';
import { Icon, chevronLeft, chevronRight } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import classNames from 'classnames';
import React, { useEffect } from 'react';
import { Item } from './item';
import { Pattern } from './types';

const patterns: Pattern[] = [
	{
		id: 5816,
		siteId: 174455321,
		name: 'Biba',
	},
	{
		id: 5811,
		siteId: 174455321,
		name: 'Chloe Currie',
	},
	{
		id: 5820,
		siteId: 174455321,
		name: 'Emily Jennings',
	},
	{
		id: 5822,
		siteId: 174455321,
		name: 'Luis Carballeda',
	},
	{
		id: 5829,
		siteId: 174455321,
		name: 'Xue Tengfei',
	},
	{
		id: 5837,
		siteId: 174455321,
		name: 'Biba',
	},
	{
		id: 5816,
		siteId: 174455321,
		name: 'Paul Nyberg',
	},
	{
		id: 5842,
		siteId: 174455321,
		name: 'Ella D.',
	},
	{
		id: 5844,
		siteId: 174455321,
		name: 'Mesh Gradient',
	},
	{
		id: 5851,
		siteId: 174455321,
		name: 'horizontal Split',
	},
	{
		id: 5856,
		siteId: 174455321,
		name: 'left-aligned with yellow background',
	},
	{
		id: 5864,
		siteId: 174455321,
		name: 'Link Cloud',
	},
	{
		id: 5869,
		siteId: 174455321,
		name: 'Two columns and dark background',
	},
	{
		id: 5805,
		siteId: 174455321,
		name: 'Yellow background',
	},
];

function width( el: HTMLDivElement | null ) {
	return Math.floor( el?.getBoundingClientRect().width ?? 1 );
}

type Props = { onPick: ( pattern: string ) => void };

export function PatternPicker( { onPick }: Props ) {
	const [ index, setIndex ] = React.useState( 0 );
	const [ currentRef, setRef ] = React.useState< HTMLDivElement >();
	const [ timeoutRef, setTimeoutRef ] = React.useState( 0 );
	const { __ } = useI18n();

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
						key={ pattern.id }
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
					onClick={ () => onPick( patterns[ index ].name ) }
				>
					<span>{ __( 'Continue' ) }</span>
					<Gridicon icon="heart" size={ 18 } />
				</Button>
			</div>
		</div>
	);
}
