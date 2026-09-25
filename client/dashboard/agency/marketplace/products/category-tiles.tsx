import {
	Button,
	Icon,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, isRTL } from '@wordpress/i18n';
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
import { BRAND_MARKS } from './lib/brand-marks';
import { getBrandLabels, getCategoryShortLabels } from './lib/product-categories';
import type { ProductBrand, ProductCategory } from './lib/product-categories';

export type CategoryTileValue = ProductBrand | ProductCategory;

interface Tile {
	value: CategoryTileValue;
	label: string;
	logo?: string;
	icon?: JSX.Element;
}

const CATEGORY_ICONS: Record< ProductCategory, JSX.Element > = {
	payments: currencyDollar,
	security: lock,
	performance: next,
	social: people,
	growth: trendingUp,
	shipping,
	conversion: percent,
	'customer-service': commentAuthorName,
	merchandising: siteLogo,
	'store-content': postContent,
	'store-management': store,
};

export function isCategoryTileValue( value: unknown ): value is CategoryTileValue {
	return (
		typeof value === 'string' &&
		[ ...Object.keys( BRAND_MARKS ), ...Object.keys( CATEGORY_ICONS ) ].includes( value )
	);
}

// The classic dashboard's category menu, in its order.
function getTiles( { showPressable }: { showPressable: boolean } ): Tile[] {
	const brandLabels = getBrandLabels();
	const categoryLabels = getCategoryShortLabels();
	const brands: ProductBrand[] = showPressable
		? [ 'jetpack', 'woocommerce', 'pressable' ]
		: [ 'jetpack', 'woocommerce' ];
	const categories = Object.keys( CATEGORY_ICONS ) as ProductCategory[];

	return [
		...brands.map( ( brand ) => ( {
			value: brand,
			label: brand === 'woocommerce' ? __( 'Woo' ) : brandLabels[ brand ],
			logo: BRAND_MARKS[ brand ],
		} ) ),
		...categories.map( ( category ) => ( {
			value: category,
			label: categoryLabels[ category ],
			icon: CATEGORY_ICONS[ category ],
		} ) ),
	];
}

export default function CategoryTiles( {
	selected,
	showPressable,
	onSelect,
}: {
	selected: CategoryTileValue | null;
	showPressable: boolean;
	onSelect: ( category: CategoryTileValue | null ) => void;
} ) {
	const rowRef = useRef< HTMLDivElement >( null );
	const [ canScroll, setCanScroll ] = useState( { back: false, forward: false } );

	// Re-measured when the Pressable tile shows up after the first render, since
	// the observer only sees the row's own box, not its scroll width.
	useEffect( () => {
		const row = rowRef.current;
		if ( ! row ) {
			return;
		}
		// scrollLeft is negative in RTL, so compare its magnitude.
		const update = () => {
			const offset = Math.abs( row.scrollLeft );
			const max = row.scrollWidth - row.clientWidth;
			setCanScroll( { back: offset > 1, forward: offset < max - 1 } );
		};
		update();
		row.addEventListener( 'scroll', update, { passive: true } );
		const observer = new ResizeObserver( update );
		observer.observe( row );
		return () => {
			row.removeEventListener( 'scroll', update );
			observer.disconnect();
		};
	}, [ showPressable ] );

	const scrollPage = ( direction: 1 | -1 ) => {
		const row = rowRef.current;
		if ( row ) {
			const sign = getComputedStyle( row ).direction === 'rtl' ? -1 : 1;
			row.scrollBy( { left: sign * direction * row.clientWidth * 0.8, behavior: 'smooth' } );
		}
	};

	return (
		<VStack spacing={ 4 }>
			<SectionHeader
				level={ 2 }
				title={ __( 'Shop products by category' ) }
				actions={
					<HStack spacing={ 1 } expanded={ false }>
						<Button
							icon={ isRTL() ? chevronRight : chevronLeft }
							label={ __( 'Previous categories' ) }
							size="compact"
							variant="tertiary"
							accessibleWhenDisabled
							disabled={ ! canScroll.back }
							onClick={ () => scrollPage( -1 ) }
						/>
						<Button
							icon={ isRTL() ? chevronLeft : chevronRight }
							label={ __( 'Next categories' ) }
							size="compact"
							variant="tertiary"
							accessibleWhenDisabled
							disabled={ ! canScroll.forward }
							onClick={ () => scrollPage( 1 ) }
						/>
					</HStack>
				}
			/>
			<div className="dashboard-marketplace-products__tiles-wrap">
				<div
					ref={ rowRef }
					className="dashboard-marketplace-products__tiles"
					role="group"
					aria-label={ __( 'Product categories' ) }
				>
					{ getTiles( { showPressable } ).map( ( tile ) => {
						const isSelected = selected === tile.value;
						const toggle = () => onSelect( isSelected ? null : tile.value );
						return (
							<Card
								key={ tile.value }
								className={ clsx( 'dashboard-marketplace-products__tile', {
									'is-selected': isSelected,
								} ) }
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
								<CardBody className="dashboard-marketplace-products__tile-body">
									{ tile.logo ? (
										<img
											src={ tile.logo }
											alt=""
											className="dashboard-marketplace-products__tile-mark"
										/>
									) : (
										<Icon icon={ tile.icon } size={ 20 } />
									) }
									<Text weight={ 500 }>{ tile.label }</Text>
								</CardBody>
							</Card>
						);
					} ) }
				</div>
			</div>
		</VStack>
	);
}
