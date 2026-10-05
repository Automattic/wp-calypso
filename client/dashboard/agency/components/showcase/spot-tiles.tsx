import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { Icon } from '@wordpress/icons';
import clsx from 'clsx';
import { Card, CardBody } from '../../../components/card';
import Divider from '../../../components/divider';
import { SectionHeader } from '../../../components/section-header';
import { rowArrows, useRowScroll } from './row-arrows';
import type { RowArrowLabels } from './row-arrows';

import './spot-tiles.scss';

export interface SpotTile< T extends string > {
	value: T;
	label: string;
	icon?: JSX.Element;
	/** A mark already sized, such as a brand logo, shown in place of the icon. */
	mark?: React.ReactNode;
	/** Starts a new group, with a divider before it. */
	startsGroup?: boolean;
}

// The row sits under a heading, or under controls such as search in its place.
type SpotTilesHeading = { title: string; lead?: never } | { lead: React.ReactNode; title?: never };

export default function SpotTiles< T extends string >( {
	title,
	label,
	arrowLabels,
	options,
	selected,
	onSelect,
	lead,
	all,
}: SpotTilesHeading & {
	arrowLabels: RowArrowLabels;
	/** A first tile that clears the selection, selected while nothing else is. */
	all?: { label: string; icon: JSX.Element };
	/** The accessible name of the group of tiles. */
	label: string;
	options: SpotTile< T >[];
	selected: T | null;
	onSelect: ( value: T | null ) => void;
} ) {
	const { rowRef, canScroll, isInset, page } = useRowScroll< HTMLDivElement >();

	return (
		<VStack spacing={ 4 } className="dashboard-spot-tiles">
			{ lead ? (
				<HStack justify="space-between" alignment="center">
					{ lead }
					{ rowArrows( { canScroll, page, labels: arrowLabels } ) }
				</HStack>
			) : (
				<SectionHeader
					level={ 2 }
					title={ title }
					actions={ rowArrows( { canScroll, page, labels: arrowLabels } ) }
				/>
			) }
			<HStack
				ref={ rowRef }
				spacing={ 2 }
				justify="flex-start"
				alignment="stretch"
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
							<Divider
								key={ `${ option.value }-divider` }
								orientation="vertical"
								className="dashboard-spot-tiles__divider"
							/>
						),
						<Tile
							key={ option.value }
							label={ option.label }
							media={
								option.mark ?? ( option.icon ? <Icon icon={ option.icon } size={ 32 } /> : null )
							}
							isSelected={ isSelected }
							onSelect={ () => onSelect( isSelected ? null : option.value ) }
						/>,
					];
				} ) }
			</HStack>
		</VStack>
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
				<VStack spacing={ 2 } alignment="center">
					{ media }
					<Text
						size={ 13 }
						weight={ 500 }
						lineHeight="16px"
						className="dashboard-spot-tiles__label"
					>
						{ label }
					</Text>
				</VStack>
			</CardBody>
		</Card>
	);
}
