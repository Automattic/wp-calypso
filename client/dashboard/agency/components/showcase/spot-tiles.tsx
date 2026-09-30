import { __experimentalHStack as HStack } from '@wordpress/components';
import clsx from 'clsx';
import { Card, CardBody } from '../../../components/card';
import { SectionHeader } from '../../../components/section-header';
import { rowArrows, useRowScroll } from './row-arrows';

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
	lead,
}: {
	title: string;
	/** Replaces the heading with these controls (search), previous and next beside them. */
	lead?: React.ReactNode;
	/** The accessible name of the group of tiles. */
	label: string;
	options: SpotTile< T >[];
	selected: T | null;
	onSelect: ( value: T | null ) => void;
} ) {
	const { rowRef, canScroll, page } = useRowScroll< HTMLDivElement >();

	return (
		<div className="dashboard-spot-tiles">
			{ lead ? (
				<HStack justify="space-between" alignment="center">
					{ lead }
					{ rowArrows( { canScroll, page } ) }
				</HStack>
			) : (
				<SectionHeader level={ 2 } title={ title } actions={ rowArrows( { canScroll, page } ) } />
			) }
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
