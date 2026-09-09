import {
	Icon,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import {
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
import { Card, CardBody } from '../../../components/card';
import { SectionHeader } from '../../../components/section-header';
import jetpackLogo from '../exclusive-offers/images/jetpack-descriptor.svg';
import pressableLogo from '../exclusive-offers/images/pressable-descriptor.svg';
import wooLogo from '../exclusive-offers/images/woo-descriptor.svg';
import { getBrandLabels, getCategoryShortLabels } from './lib/product-categories';
import type { ProductBrand, ProductCategory } from './lib/product-categories';

export type CategoryTileValue = ProductBrand | ProductCategory;

export function isCategoryTileValue( value: unknown ): value is CategoryTileValue {
	return (
		typeof value === 'string' &&
		[ ...Object.keys( BRAND_LOGOS ), ...Object.keys( CATEGORY_ICONS ) ].includes( value )
	);
}

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

const BRAND_LOGOS: Record< ProductBrand, string > = {
	jetpack: jetpackLogo,
	woocommerce: wooLogo,
	pressable: pressableLogo,
};

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
			label: brandLabels[ brand ],
			logo: BRAND_LOGOS[ brand ],
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
	return (
		<VStack spacing={ 4 }>
			<SectionHeader level={ 2 } title={ __( 'Shop products by category' ) } />
			<div className="dashboard-marketplace-products__tiles-wrap">
				<div
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
											alt={ tile.label }
											className="dashboard-marketplace-products__tile-logo"
										/>
									) : (
										<span className="dashboard-marketplace-products__tile-label">
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
