/* eslint-disable wpcalypso/jsx-classname-namespace */
import { Gridicon } from '@automattic/components';
import { Button } from '@wordpress/components';
import { Icon, chevronLeft, chevronRight } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
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
	return Math.floor( el?.getBoundingClientRect().width ?? 1 );
}

type Props = { onPick: ( pattern: string ) => void };

export function PatternPicker( { onPick }: Props ) {
	const [ index, setIndex ] = React.useState( 0 );
	const [ selectedItem, setSelectedItem ] = React.useState< string | null >( null );
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
					setSelectedItem( patterns[ index ] );
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
						className={ classNames( `pattern-${ pattern }`, { 'is-active': index === i } ) }
						key={ pattern }
						onClick={ () => {
							setIndex( i );
							setSelectedItem( pattern );
						} }
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
					disabled={ ! selectedItem }
					style={ { opacity: selectedItem ? 1 : 0 } }
					className="pattern-picker__select"
					isPrimary
					onClick={ () => onPick( selectedItem as string ) }
				>
					<span>{ __( 'Continue' ) }</span>
					<Gridicon icon="heart" size={ 18 } />
				</Button>
			</div>
		</div>
	);
}
