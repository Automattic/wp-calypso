/* eslint-disable wpcalypso/jsx-classname-namespace */
import { Icon, chevronLeft, chevronRight } from '@wordpress/icons';
import classNames from 'classnames';
import React, { useEffect } from 'react';
import { Item } from './item';

const patterns = [
	'17-2',
	'black',
	'ella-d',
	'link-cloud',
	'matt-smith',
	'ose-maiko',
	'purple',
	'yellow',
	'biba',
	'chloe-currie',
	'emily',
	'luis-carvelleda',
	'mesh-gradient',
	'paul-nyberg',
	'tengfai',
];

function width( el: HTMLDivElement | null ) {
	return el?.getBoundingClientRect().width ?? 1;
}

export function PatternPicker() {
	const [ index, setIndex ] = React.useState( 0 );
	const [ currentRef, setRef ] = React.useState< HTMLDivElement >();

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
		const itemWidth = width( event.currentTarget?.firstChild as HTMLDivElement );
		const itemWidthWithGap = itemWidth + 20;
		const index = ( event.currentTarget.scrollLeft - itemWidth / 2 ) / itemWidthWithGap;
		// if index is an integer, it means the scrolling transition is over
		if ( index - Math.floor( index ) === 0 && index >= 0 && index < patterns.length - 1 ) {
			setIndex( index );
		}
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
						className={ classNames( `pattern-${ pattern }`, { 'is-active': index === i } ) }
						key={ pattern }
						onClick={ () => setIndex( i ) }
					/>
				) ) }
			</div>
			<button
				className="pattern-picker__carousel-nav-button pattern-picker__carousel-nav-button--back"
				onClick={ () => setIndex( index - 1 ) }
				disabled={ index === 0 }
			>
				<Icon icon={ chevronLeft } />
			</button>
			<button
				className="pattern-picker__carousel-nav-button pattern-picker__carousel-nav-button--next"
				onClick={ () => setIndex( index + 1 ) }
				disabled={ index === patterns.length - 1 }
			>
				<Icon icon={ chevronRight } />
			</button>
		</div>
	);
}
