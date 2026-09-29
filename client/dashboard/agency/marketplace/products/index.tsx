import { activeAgencyQuery, agencyProductsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalSpacer as Spacer,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __, _n, sprintf } from '@wordpress/i18n';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAnalytics } from '../../../app/analytics';
import { useIntlLocale } from '../../../app/locale';
import { marketplaceProductsRoute } from '../../../app/router/agency';
import Grid from '../../../components/grid';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import { SectionHeader } from '../../../components/section-header';
import { SPOTS } from '../../components/showcase/spots';
import { isPressablePlanLicense, pressableLicensesQuery } from '../hosting/lib/pressable-products';
import { isAgencyApproved } from '../is-agency-approved';
import ReferralToggle from '../referral-toggle';
import TermPricingToggle from '../term-pricing-toggle';
import { useMarketplaceType } from '../use-marketplace-type';
import { useTermPricing } from '../use-term-pricing';
import CartMenu from './cart-menu';
import CategoryTiles, { isProductCategory } from './category-tiles';
import FeaturedShowcase from './featured-showcase';
import {
	getBrandLabels,
	getCategoryShortLabels,
	getProductBrand,
	getProductFilterCategories,
	getProductType,
	getTypeLabels,
	isPressableAddon,
} from './lib/product-categories';
import {
	getFeaturedProducts,
	getItemId,
	getMarketplaceProducts,
	getProductListItems,
	getProductSections,
} from './lib/product-groups';
import { isFreeProduct } from './lib/product-pricing';
import { getProductSearchText } from './lib/product-search';
import ProductCardSkeleton from './product-card-skeleton';
import ProductDetailsModal from './product-details-modal';
import ProductStoreCard from './product-store-card';
import { parseCartEntries, useShoppingCart } from './use-shopping-cart';
import type { ProductBrand, ProductCategory } from './lib/product-categories';
import type { ProductListItem, ProductSection } from './lib/product-groups';
import type { AgencyProduct } from '@automattic/api-core';
import type { Field, View } from '@wordpress/dataviews';

import './style.scss';

const DEFAULT_VIEW: View = {
	type: 'list',
	fields: [],
	search: '',
	filters: [],
	page: 1,
	perPage: 1000,
};

// The classic marketplace's deep-link params, kept so existing links keep working.
interface ProductsSearchParams {
	search_query?: string;
	category?: string;
	product_slug?: string;
	products?: string;
	purchase_type?: string;
}

type CategoryFilterValue = ProductBrand | ProductCategory;

// Classic category keys that differ from the filter values.
const CLASSIC_CATEGORY_KEYS: Record< string, CategoryFilterValue > = {
	'pressable-addon': 'pressable',
	'shipping-delivery-fulfillment': 'shipping',
	'store-content-and-customization': 'store-content',
};

const isCategoryFilterValue = ( value: unknown ): value is CategoryFilterValue =>
	isProductCategory( value ) ||
	( typeof value === 'string' && Object.keys( getBrandLabels() ).includes( value ) );

const getSectionTitle = ( key: ProductSection[ 'key' ] ) =>
	key === 'other' ? __( 'Plans, add-ons and more' ) : getCategoryShortLabels()[ key ];

const PRODUCT_GRID_COLUMNS = 'repeat( auto-fill, minmax( 300px, 1fr ) )';

// TODO: Still missing from the classic Products page:
// - the agency approval notice (pending / approved / rejected)
// - the overdue invoice notice
// - the guided tour
// - Pressable PHP memory add-ons targeting a specific site
export default function MarketplaceProducts() {
	const { recordTracksEvent } = useAnalytics();
	const { marketplaceType, updateMarketplaceType } = useMarketplaceType();
	const { termPricing } = useTermPricing();
	const isReferralMode = marketplaceType === 'referral';

	const { data: agency } = useQuery( activeAgencyQuery() );
	const agencyId = agency?.id ?? 0;

	const { data: allProducts, isLoading } = useQuery( agencyProductsQuery( agencyId ) );

	// Pressable add-ons only make sense for an agency that owns a Pressable plan
	// (not one it referred), except in referral mode, where a client may buy them.
	const { data: pressableLicenses } = useQuery( {
		...pressableLicensesQuery( agencyId ),
		enabled: agencyId > 0,
	} );
	const hasPressablePlan = pressableLicenses?.some( isPressablePlanLicense ) ?? false;
	const showPressableAddons = isReferralMode || hasPressablePlan;

	const products = useMemo( () => {
		const marketplaceProducts = getMarketplaceProducts( allProducts ?? [] );
		return showPressableAddons
			? marketplaceProducts
			: marketplaceProducts.filter( ( product ) => ! isPressableAddon( product ) );
	}, [ allProducts, showPressableAddons ] );

	const searchParams = marketplaceProductsRoute.useSearch() as ProductsSearchParams;
	const {
		items: cartItems,
		hasItem,
		addItem,
		removeItem,
		replaceItems,
		clearCart,
	} = useShoppingCart();
	const [ view, setView ] = useState< View >( () => {
		const category = searchParams.category
			? ( CLASSIC_CATEGORY_KEYS[ searchParams.category ] ?? searchParams.category )
			: null;
		return {
			...DEFAULT_VIEW,
			search: searchParams.search_query != null ? String( searchParams.search_query ) : '',
			filters: isCategoryFilterValue( category )
				? [ { field: 'category', operator: 'isAny', value: [ category ] } ]
				: [],
		};
	} );
	// The category tiles read and write the list's own category filter, so a
	// tile, the filter button and the filter chip always show the same
	// selection, and the chip's remove button is a way back. A tile is selected
	// when its job is the only category set.
	const categoryFilter = view.filters?.find( ( filter ) => filter.field === 'category' );
	const selectedCategory =
		Array.isArray( categoryFilter?.value ) &&
		categoryFilter.value.length === 1 &&
		isProductCategory( categoryFilter.value[ 0 ] )
			? categoryFilter.value[ 0 ]
			: null;

	// `?product_slug=a,b` and `?products=a:2,b:1` replace the cart with those
	// products, as the classic products page does.
	const hasPreselected = useRef( false );
	useEffect( () => {
		if ( hasPreselected.current || ! allProducts ) {
			return;
		}
		const productSlug =
			searchParams.product_slug != null ? String( searchParams.product_slug ) : '';
		const productsParam = searchParams.products != null ? String( searchParams.products ) : '';
		if ( ! productSlug && ! productsParam ) {
			return;
		}
		// Classic referral links carry the mode. The cart is stored per mode, so
		// switch first and fill the cart on the next pass.
		if ( searchParams.purchase_type === 'referral' && marketplaceType !== 'referral' ) {
			updateMarketplaceType( 'referral' );
			return;
		}
		const entries = productSlug
			? productSlug.split( ',' ).map( ( slug ) => ( { slug, quantity: 1 } ) )
			: parseCartEntries( productsParam ).map( ( { slug, quantity } ) => ( { slug, quantity } ) );
		// Like classic, only WordPress.com hosting takes a quantity; bundles are not
		// sold under Billing Dragon.
		const known = entries.filter(
			( { slug, quantity } ) =>
				allProducts.some( ( product ) => product.slug === slug ) &&
				( quantity === 1 || slug.startsWith( 'wpcom-hosting' ) )
		);
		hasPreselected.current = true;
		replaceItems( known );
	}, [
		allProducts,
		searchParams.product_slug,
		searchParams.products,
		searchParams.purchase_type,
		marketplaceType,
		updateMarketplaceType,
		replaceItems,
	] );
	const [ detailsProduct, setDetailsProduct ] = useState< AgencyProduct | null >( null );

	const fields = useMemo< Field< AgencyProduct >[] >( () => {
		const brandLabels = getBrandLabels();
		const categoryLabels = getCategoryShortLabels();
		const typeLabels = getTypeLabels();
		return [
			{
				id: 'name',
				label: __( 'Name' ),
				type: 'text',
				enableGlobalSearch: true,
				getValue: ( { item } ) => getProductSearchText( item ),
			},
			{
				id: 'category',
				label: __( 'Category' ),
				type: 'text',
				elements: [
					...( Object.keys( brandLabels ) as ProductBrand[] ).map( ( brand ) => ( {
						value: brand,
						label: brandLabels[ brand ],
					} ) ),
					...( Object.keys( categoryLabels ) as ProductCategory[] ).map( ( category ) => ( {
						value: category,
						label: categoryLabels[ category ],
					} ) ),
				],
				// While a tile has set a category, the filter is primary, so DataViews
				// shows its chip instead of only counting it on the filter button.
				filterBy: { operators: [ 'isAny' ], isPrimary: selectedCategory !== null },
				enableSorting: false,
				getValue: ( { item } ) => [
					getProductBrand( item ),
					...getProductFilterCategories( item ),
				],
			},
			{
				id: 'vendor',
				label: __( 'Developed by' ),
				type: 'text',
				elements: [ { value: 'woocommerce', label: __( 'WooCommerce' ) } ],
				filterBy: { operators: [ 'is' ] },
				enableSorting: false,
				getValue: ( { item } ) =>
					getProductBrand( item ) === 'woocommerce' ? 'woocommerce' : '',
			},
			{
				id: 'type',
				label: __( 'Type' ),
				type: 'text',
				elements: ( Object.keys( typeLabels ) as ( keyof typeof typeLabels )[] ).map(
					( type ) => ( {
						value: type,
						label: typeLabels[ type ],
					} )
				),
				filterBy: { operators: [ 'is' ] },
				enableSorting: false,
				getValue: ( { item } ) => getProductType( item ),
			},
			{
				id: 'price',
				label: __( 'Price' ),
				type: 'text',
				elements: [
					{ value: 'free', label: __( 'Free' ) },
					{ value: 'paid', label: __( 'Paid' ) },
				],
				filterBy: { operators: [ 'is' ] },
				enableSorting: false,
				getValue: ( { item } ) => ( isFreeProduct( item ) ? 'free' : 'paid' ),
			},
		];
	}, [ selectedCategory ] );

	const { data: filteredProducts } = useMemo(
		() => filterSortAndPaginate( products, view, fields ),
		[ products, view, fields ]
	);
	// With nothing searched or filtered, the products sit in one section per job;
	// otherwise they sit in one grid with a count.
	const isNarrowed = view.search !== '' || ( view.filters?.length ?? 0 ) > 0;
	const locale = useIntlLocale();
	const featuredProducts = useMemo( () => getFeaturedProducts( products ), [ products ] );
	const sections = useMemo(
		() => ( isNarrowed ? [] : getProductSections( products, locale ) ),
		[ isNarrowed, products, locale ]
	);
	const filteredItems = useMemo(
		() => ( isNarrowed ? getProductListItems( filteredProducts, locale ) : [] ),
		[ isNarrowed, filteredProducts, locale ]
	);
	const resultCount = sprintf(
		/* translators: %d: number of matching products */
		_n( '%d product', '%d products', filteredItems.length ),
		filteredItems.length
	);
	// One category picked, and nothing else narrowing the list, reads as that
	// category's own section: its spot, its name, and the count beside it.
	const pickedCategory =
		selectedCategory && ! view.search && ( view.filters?.length ?? 0 ) === 1
			? selectedCategory
			: null;

	const handleViewChange = ( nextView: View ) => {
		if ( nextView.search !== view.search ) {
			recordTracksEvent( 'calypso_a4a_marketplace_products_overview_input_search', {
				searchQuery: nextView.search,
			} );
		}
		if ( nextView.filters !== view.filters ) {
			if ( ( nextView.filters?.length ?? 0 ) === 0 && ( view.filters?.length ?? 0 ) > 0 ) {
				recordTracksEvent( 'calypso_a4a_marketplace_products_overview_reset_filter' );
			} else {
				const selected = ( id: string ) =>
					( nextView.filters ?? [] )
						.filter( ( filter ) => filter.field === id )
						.flatMap( ( filter ) => filter.value )
						.join( ',' );
				recordTracksEvent( 'calypso_a4a_marketplace_products_overview_select_filter', {
					categories: selected( 'category' ),
					types: selected( 'type' ),
					prices: selected( 'price' ),
				} );
			}
		}
		setView( nextView );
	};

	const handleTileSelect = ( category: ProductCategory | null ) => {
		if ( category ) {
			recordTracksEvent( 'calypso_a4a_marketplace_product_category_selected', { category } );
		}
		setView( ( current ) => ( {
			...current,
			page: 1,
			filters: [
				...( current.filters ?? [] ).filter( ( filter ) => filter.field !== 'category' ),
				...( category
					? [ { field: 'category', operator: 'isAny' as const, value: [ category ] } ]
					: [] ),
			],
		} ) );
	};

	const toggleCart = useCallback(
		( product: AgencyProduct ) => {
			const wasInCart = hasItem( product.slug );
			if ( wasInCart ) {
				removeItem( product.slug );
			} else {
				addItem( product.slug );
			}
			recordTracksEvent(
				wasInCart
					? 'calypso_a4a_marketplace_products_overview_unselect_product'
					: 'calypso_a4a_marketplace_products_overview_select_product',
				{
					product: product.slug,
					quantity: 1,
					purchase_mode: marketplaceType,
					term_pricing: termPricing,
				}
			);
		},
		[ hasItem, addItem, removeItem, recordTracksEvent, marketplaceType, termPricing ]
	);

	const openDetails = ( product: AgencyProduct ) => {
		recordTracksEvent( 'calypso_marketplace_products_overview_product_view', {
			product: product.slug,
		} );
		setDetailsProduct( product );
	};

	const renderGrid = ( items: ProductListItem[] ) => (
		<Grid templateColumns={ PRODUCT_GRID_COLUMNS } gap="lg">
			{ items.map( ( item ) => (
				<ProductStoreCard
					key={ getItemId( item ) }
					item={ item }
					term={ termPricing }
					isReferralMode={ isReferralMode }
					isInCart={ hasItem }
					onToggleCart={ toggleCart }
					onViewDetails={ openDetails }
					onSelectVariant={ ( product ) =>
						recordTracksEvent( 'calypso_a4a_marketplace_products_overview_variant_option_click', {
							product: product.slug,
						} )
					}
				/>
			) ) }
		</Grid>
	);

	return (
		<PageLayout
			header={
				<PageHeader
					title={ __( 'Extend your clients’ sites' ) }
					description={ __(
						'Extensions, plans, and add-ons for your clients’ sites. Buy for your agency or refer them to a client.'
					) }
					actions={
						<HStack spacing={ 4 } expanded={ false }>
							<TermPricingToggle />
							<ReferralToggle />
							<CartMenu
								items={ cartItems }
								products={ allProducts ?? [] }
								term={ termPricing }
								isReferralMode={ isReferralMode }
								isAgencyApproved={ isAgencyApproved( agency ) }
								onRemove={ removeItem }
								onCheckout={ clearCart }
							/>
						</HStack>
					}
				/>
			}
		>
			{ detailsProduct && (
				<ProductDetailsModal
					product={ detailsProduct }
					term={ termPricing }
					isReferralMode={ isReferralMode }
					inCart={ hasItem( detailsProduct.slug ) }
					onToggleCart={ () => toggleCart( detailsProduct ) }
					onClose={ () => setDetailsProduct( null ) }
				/>
			) }
			{ ! isLoading && featuredProducts.length > 0 && (
				<FeaturedShowcase
					products={ featuredProducts }
					term={ termPricing }
					isReferralMode={ isReferralMode }
					isInCart={ hasItem }
					onToggleCart={ toggleCart }
					onViewDetails={ openDetails }
				/>
			) }
			<div className="dashboard-marketplace-products__filters">
				<DataViews< AgencyProduct >
					data={ products }
					getItemId={ ( item ) => item.slug }
					fields={ fields }
					view={ view }
					onChangeView={ handleViewChange }
					paginationInfo={ { totalItems: products.length, totalPages: 1 } }
					defaultLayouts={ { list: {} } }
					search
				>
					<CategoryTiles selected={ selectedCategory } onSelect={ handleTileSelect } />
					<HStack justify="space-between" className="dashboard-marketplace-products__toolbar">
						<HStack justify="flex-start" expanded={ false }>
							<DataViews.Search />
							<DataViews.FiltersToggle />
						</HStack>
					</HStack>
					<Spacer marginBottom={ 4 }>
						<DataViews.FiltersToggled />
					</Spacer>
				</DataViews>
			</div>
			{ isLoading && (
				<Grid templateColumns={ PRODUCT_GRID_COLUMNS } gap="lg">
					{ Array.from( { length: 4 }, ( _, index ) => (
						<ProductCardSkeleton key={ index } />
					) ) }
				</Grid>
			) }
			{ ! isLoading && isNarrowed && (
				<VStack
					spacing={ 4 }
					justify="flex-start"
					className="dashboard-marketplace-products__results"
				>
					{ pickedCategory ? (
						<SectionHeader
							level={ 2 }
							title={
								<>
									{ getSectionTitle( pickedCategory ) }
									<span className="dashboard-marketplace-products__job-count">{ resultCount }</span>
								</>
							}
							className="dashboard-marketplace-products__section-header"
							decoration={ <img src={ SPOTS[ pickedCategory ] } alt="" /> }
						/>
					) : (
						<SectionHeader level={ 2 } title={ resultCount } />
					) }
					{ filteredItems.length === 0 ? (
						<VStack spacing={ 1 }>
							<Text weight={ 500 }>{ __( 'Sorry, no results found.' ) }</Text>
							<Text variant="muted">
								{ __(
									'Please try refining your search and filtering to find what you’re looking for.'
								) }
							</Text>
						</VStack>
					) : (
						renderGrid( filteredItems )
					) }
				</VStack>
			) }
			{ ! isLoading && ! isNarrowed && (
				<VStack spacing={ 10 }>
					{ sections.map( ( section ) => (
						<VStack key={ section.key } spacing={ 4 }>
							<SectionHeader
								level={ 2 }
								title={ getSectionTitle( section.key ) }
								className="dashboard-marketplace-products__section-header"
								decoration={
									<img src={ SPOTS[ section.key === 'other' ? 'more' : section.key ] } alt="" />
								}
							/>
							{ renderGrid( section.items ) }
						</VStack>
					) ) }
				</VStack>
			) }
		</PageLayout>
	);
}
