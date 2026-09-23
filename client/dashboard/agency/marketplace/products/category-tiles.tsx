import {
	Button,
	Icon,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import {
	chevronLeft,
	chevronRight,
	commentAuthorName,
	currencyDollar,
	lock,
	next,
	people,
	percent,
	postContent,
	shipping,
	siteLogo,
	store,
	trendingUp,
} from '@wordpress/icons';
import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { Card, CardBody } from '../../../components/card';
import { SectionHeader } from '../../../components/section-header';
import jetpackLogo from '../exclusive-offers/images/jetpack-descriptor.svg';
import wooLogo from '../exclusive-offers/images/woo-descriptor.svg';

// Main's "Shop products by category" menu: brand tiles then category tiles,
// in Main's order with Main's icons (product-filter/hooks/use-product-filter-options).
// Here it's the Tiers page's horizontal card row (scroll, hidden scrollbar,
// gradient fade), and each tile sets the DataViews category filter.
const TILES: { value: string; label: string; logo?: string; icon?: JSX.Element }[] = [
	{ value: 'Jetpack', label: 'Jetpack', logo: jetpackLogo },
	{ value: 'WooCommerce', label: 'WooCommerce', logo: wooLogo },
	{ value: 'Payments', label: __( 'Payments' ), icon: currencyDollar },
	{ value: 'Security', label: __( 'Security' ), icon: lock },
	{ value: 'Performance', label: __( 'Performance' ), icon: next },
	{ value: 'Social', label: __( 'Social' ), icon: people },
	{ value: 'Growth', label: __( 'Growth' ), icon: trendingUp },
	{ value: 'Shipping', label: __( 'Shipping' ), icon: shipping },
	{ value: 'Conversion', label: __( 'Conversion' ), icon: percent },
	{ value: 'Customer service', label: __( 'Customer service' ), icon: commentAuthorName },
	{ value: 'Merchandising', label: __( 'Merchandising' ), icon: siteLogo },
	{ value: 'Store content', label: __( 'Store content' ), icon: postContent },
	{ value: 'Store management', label: __( 'Store management' ), icon: store },
];

export default function CategoryTiles( {
	selected,
	onSelect,
}: {
	selected: string | null;
	onSelect: ( category: string | null ) => void;
} ) {
	// A4AD-191: prev/next arrows in the section header, the way a scroll row
	// carries its controls elsewhere in the dashboard. The row still scrolls
	// by touch and trackpad; the arrows page it by most of the visible width
	// and disable at either end, so they double as the "there is more" hint
	// the gradient fade was carrying alone.
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
		if ( row ) {
			row.scrollBy( { left: direction * row.clientWidth * 0.8, behavior: 'smooth' } );
		}
	};

	return (
		<VStack spacing={ 4 } className="marketplace-products__categories">
			<SectionHeader
				level={ 2 }
				title={ __( 'Shop products by category' ) }
				actions={
					<HStack spacing={ 1 } expanded={ false }>
						<Button
							icon={ chevronLeft }
							label={ __( 'Previous categories' ) }
							size="compact"
							variant="tertiary"
							disabled={ ! canScroll.back }
							onClick={ () => page( -1 ) }
						/>
						<Button
							icon={ chevronRight }
							label={ __( 'Next categories' ) }
							size="compact"
							variant="tertiary"
							disabled={ ! canScroll.forward }
							onClick={ () => page( 1 ) }
						/>
					</HStack>
				}
			/>
			<div className="marketplace-products__tiles-wrap">
				<div
					ref={ rowRef }
					className="marketplace-products__tiles"
					role="group"
					aria-label={ __( 'Product categories' ) }
				>
					{ TILES.map( ( tile ) => {
						const isSelected = selected === tile.value;
						return (
							<Card
								key={ tile.value }
								className={ clsx( 'marketplace-products__tile', { 'is-selected': isSelected } ) }
								role="button"
								tabIndex={ 0 }
								aria-pressed={ isSelected }
								onClick={ () => onSelect( isSelected ? null : tile.value ) }
								onKeyDown={ ( event: React.KeyboardEvent ) => {
									if ( event.key === 'Enter' || event.key === ' ' ) {
										event.preventDefault();
										onSelect( isSelected ? null : tile.value );
									}
								} }
							>
								<CardBody className="marketplace-products__tile-body">
									{ tile.logo ? (
										<img
											src={ tile.logo }
											alt={ tile.label }
											className="marketplace-products__tile-logo"
										/>
									) : (
										<span className="marketplace-products__tile-label">
											<Icon icon={ tile.icon } size={ 20 } />
											<Text weight={ 500 }>{ tile.label }</Text>
										</span>
									) }
								</CardBody>
							</Card>
						);
					} ) }
				</div>
			</div>
		</VStack>
	);
}
