import { Button, __experimentalHStack as HStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { chevronLeft, chevronRight } from '@wordpress/icons';
import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { Card, CardBody } from '../../../components/card';
import { SectionHeader } from '../../../components/section-header';

import './spot-tiles.scss';

export interface SpotTile< T extends string > {
	value: T;
	label: string;
	spot: string;
}

/**
 * A list's groups as illustrated tiles above its search (A4AD-237), the way
 * delivery and shopping apps show their categories. One tile at a time
 * filters the list, and selecting it again clears it. The row scrolls when it
 * outgrows the page, with previous and next beside its heading.
 */
export default function SpotTiles< T extends string >( {
	title,
	label,
	options,
	selected,
	onSelect,
}: {
	title: string;
	/** The accessible name of the group of tiles. */
	label: string;
	options: SpotTile< T >[];
	selected: T | null;
	onSelect: ( value: T | null ) => void;
} ) {
	const rowRef = useRef< HTMLDivElement >( null );
	const [ canScroll, setCanScroll ] = useState( { back: false, forward: false } );

	useEffect( () => {
		const row = rowRef.current;
		if ( ! row ) {
			return;
		}
		const update = () => {
			const max = row.scrollWidth - row.clientWidth;
			setCanScroll( { back: row.scrollLeft > 1, forward: row.scrollLeft < max - 1 } );
		};
		update();
		row.addEventListener( 'scroll', update, { passive: true } );
		const observer = new ResizeObserver( update );
		observer.observe( row );
		return () => {
			row.removeEventListener( 'scroll', update );
			observer.disconnect();
		};
	}, [] );

	const page = ( direction: 1 | -1 ) => {
		const row = rowRef.current;
		row?.scrollBy( { left: direction * row.clientWidth * 0.8 } );
	};

	const arrows = ( canScroll.back || canScroll.forward ) && (
		<HStack spacing={ 1 } expanded={ false }>
			<Button
				icon={ chevronLeft }
				label={ __( 'Previous' ) }
				size="compact"
				variant="tertiary"
				disabled={ ! canScroll.back }
				accessibleWhenDisabled
				onClick={ () => page( -1 ) }
			/>
			<Button
				icon={ chevronRight }
				label={ __( 'Next' ) }
				size="compact"
				variant="tertiary"
				disabled={ ! canScroll.forward }
				accessibleWhenDisabled
				onClick={ () => page( 1 ) }
			/>
		</HStack>
	);

	return (
		<div className="dashboard-spot-tiles">
			<SectionHeader level={ 2 } title={ title } actions={ arrows || undefined } />
			<div
				ref={ rowRef }
				className={ clsx( 'dashboard-spot-tiles__row', {
					'can-back': canScroll.back,
					'can-forward': canScroll.forward,
				} ) }
				role="group"
				aria-label={ label }
			>
				{ options.map( ( option ) => {
					const isSelected = selected === option.value;
					const toggle = () => onSelect( isSelected ? null : option.value );
					return (
						<Card
							key={ option.value }
							className={ clsx( 'dashboard-spot-tiles__tile', { 'is-selected': isSelected } ) }
							role="button"
							tabIndex={ 0 }
							aria-pressed={ isSelected }
							onClick={ toggle }
							onKeyDown={ ( event: React.KeyboardEvent ) => {
								if ( event.key === 'Enter' || event.key === ' ' ) {
									event.preventDefault();
									toggle();
								}
							} }
						>
							<CardBody className="dashboard-spot-tiles__body">
								<img className="dashboard-spot-tiles__spot" src={ option.spot } alt="" />
								<span className="dashboard-spot-tiles__label">{ option.label }</span>
							</CardBody>
						</Card>
					);
				} ) }
			</div>
		</div>
	);
}
