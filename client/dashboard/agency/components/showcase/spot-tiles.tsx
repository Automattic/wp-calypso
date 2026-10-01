import { __experimentalHStack as HStack } from '@wordpress/components';
import { Icon } from '@wordpress/icons';
import clsx from 'clsx';
import { Card, CardBody } from '../../../components/card';
import { SectionHeader } from '../../../components/section-header';
import { rowArrows, useRowScroll } from './row-arrows';

import './spot-tiles.scss';

export interface SpotTile< T extends string > {
	value: T;
	label: string;
	spot?: string;
	/** A WordPress icon shown in place of the spot. */
	icon?: JSX.Element;
	/** A mark already sized, such as a brand logo, shown in place of the spot. */
	mark?: React.ReactNode;
	/** Starts a new group, with a divider before it. */
	startsGroup?: boolean;
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
	all,
}: {
	title: string;
	/** A first tile that clears the selection, selected while nothing else is. */
	all?: { label: string; icon: JSX.Element };
	/** Replaces the heading with these controls (search), previous and next beside them. */
	lead?: React.ReactNode;
	/** The accessible name of the group of tiles. */
	label: string;
	options: SpotTile< T >[];
	selected: T | null;
	onSelect: ( value: T | null ) => void;
} ) {
	const { rowRef, canScroll, isInset, page } = useRowScroll< HTMLDivElement >();

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
					'can-back': isInset && canScroll.back,
					'can-forward': isInset && canScroll.forward,
				} ) }
				role="group"
				aria-label={ label }
			>
				{ all && (
					<Tile
						label={ all.label }
						media={ <Icon icon={ all.icon } size={ 32 } /> }
						isSelected={ selected === null }
						onSelect={ () => onSelect( null ) }
					/>
				) }
				{ options.map( ( option ) => {
					const isSelected = selected === option.value;
					return [
						option.startsGroup && (
							<span
								key={ `${ option.value }-divider` }
								className="dashboard-spot-tiles__divider"
								aria-hidden="true"
							/>
						),
						<Tile
							key={ option.value }
							label={ option.label }
							media={
								option.mark ??
								( option.icon ? (
									<Icon icon={ option.icon } size={ 32 } />
								) : (
									<img className="dashboard-spot-tiles__spot" src={ option.spot } alt="" />
								) )
							}
							isSelected={ isSelected }
							onSelect={ () => onSelect( isSelected ? null : option.value ) }
						/>,
					];
				} ) }
			</div>
		</div>
	);
}

function Tile( {
	label,
	media,
	isSelected,
	onSelect,
}: {
	label: string;
	media: React.ReactNode;
	isSelected: boolean;
	onSelect: () => void;
} ) {
	return (
		<Card
			className={ clsx( 'dashboard-spot-tiles__tile', { 'is-selected': isSelected } ) }
			role="button"
			tabIndex={ 0 }
			aria-pressed={ isSelected }
			onClick={ onSelect }
			onKeyDown={ ( event: React.KeyboardEvent ) => {
				if ( event.key === 'Enter' || event.key === ' ' ) {
					event.preventDefault();
					onSelect();
				}
			} }
		>
			<CardBody className="dashboard-spot-tiles__body">
				<span className="dashboard-spot-tiles__media">{ media }</span>
				<span className="dashboard-spot-tiles__label">{ label }</span>
			</CardBody>
		</Card>
	);
}
