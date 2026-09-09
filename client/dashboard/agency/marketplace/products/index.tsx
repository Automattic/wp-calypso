import {
	JetpackLicenseFilter,
	JetpackLicenseSortDirection,
	JetpackLicenseSortField,
} from '@automattic/api-core';
import {
	activeAgencyQuery,
	agencyProductsQuery,
	jetpackAgencyLicensesQuery,
} from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import {
	Button,
	__experimentalGrid as Grid,
	__experimentalHStack as HStack,
	__experimentalSpacer as Spacer,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { check } from '@wordpress/icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAnalytics } from '../../../app/analytics';
import { useIntlLocale } from '../../../app/locale';
import { marketplaceProductsRoute } from '../../../app/router/agency';
import { ButtonStack } from '../../../components/button-stack';
import { Callout } from '../../../components/callout';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import { SectionHeader } from '../../../components/section-header';
import WooPaymentsIllustration from '../../overview/woopayments-illustration';
import jetpackLogo from '../exclusive-offers/images/jetpack-descriptor.svg';
import pressableLogo from '../exclusive-offers/images/pressable-descriptor.svg';
import wooLogo from '../exclusive-offers/images/woo-descriptor.svg';
import ReferralToggle from '../referral-toggle';
import TermPricingToggle from '../term-pricing-toggle';
import { useMarketplaceType } from '../use-marketplace-type';
import { useTermPricing } from '../use-term-pricing';
import CartMenu from './cart-menu';
import CategoryTiles, { isCategoryTileValue } from './category-tiles';
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
	getItemId,
	getItemProducts,
	getMarketplaceProducts,
	getProductSections,
} from './lib/product-groups';
import { isFreeProduct } from './lib/product-pricing';
import { getProductSearchText } from './lib/product-search';
import { WOOPAYMENTS_PRODUCT_SLUG } from './lib/product-slugs';
import ProductCard, { getCartActionLabel, getWooPaymentsCardCopy } from './product-card';
import ProductCardSkeleton from './product-card-skeleton';
import ProductDetailsModal from './product-details-modal';
import { useShoppingCart } from './use-shopping-cart';
import type { CategoryTileValue } from './category-tiles';
import type { ProductBrand, ProductCategory } from './lib/product-categories';
import type { ProductListItem } from './lib/product-groups';
import type { AgencyProduct } from '@automattic/api-core';
import type { Field, View } from '@wordpress/dataviews';

import './style.scss';

const BRAND_MARKS: Record< ProductBrand, string > = {
	jetpack: jetpackLogo,
	woocommerce: wooLogo,
	pressable: pressableLogo,
};

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
}

// Classic category keys that differ from the tile values.
const CLASSIC_CATEGORY_KEYS: Record< string, CategoryTileValue > = {
	'pressable-addon': 'pressable',
	'shipping-delivery-fulfillment': 'shipping',
	'store-content-and-customization': 'store-content',
};

const isPressablePlanLicense = ( licenseKey: string ) =>
	licenseKey.startsWith( 'pressable-' ) && ! licenseKey.startsWith( 'pressable-addon' );

// TODO: Still missing from the classic Products page:
// - the agency approval notice (pending / approved / rejected)
// - the overdue invoice notice
// - the guided tour
// - Pressable PHP memory add-ons targeting a specific site
export default function MarketplaceProducts() {
	const { recordTracksEvent } = useAnalytics();
	const { marketplaceType } = useMarketplaceType();
	const { termPricing } = useTermPricing();
	const isReferralMode = marketplaceType === 'referral';

	const { data: agency } = useQuery( activeAgencyQuery() );
	const agencyId = agency?.id ?? 0;
	// Old agencies didn't have approval_status set, so we need to account for that.
	const isAgencyApproved = agency?.approval_status === 'approved' || agency?.approval_status === '';

	const { data: allProducts, isLoading } = useQuery( agencyProductsQuery( agencyId ) );

	// Pressable add-ons only make sense for an agency that owns a Pressable plan
	// (not one it referred), except in referral mode, where a client may buy them.
	const { data: pressableLicenses } = useQuery( {
		...jetpackAgencyLicensesQuery( agencyId, {
			filter: JetpackLicenseFilter.NotRevoked,
			search: 'pressable',
			sortField: JetpackLicenseSortField.IssuedAt,
			sortDirection: JetpackLicenseSortDirection.Descending,
		} ),
		enabled: agencyId > 0,
	} );
	const hasPressablePlan =
		pressableLicenses?.some(
			( license ) => isPressablePlanLicense( license.license_key ) && ! license.referral
		) ?? false;
	const showPressableAddons = isReferralMode || hasPressablePlan;

	const products = useMemo( () => {
		const marketplaceProducts = getMarketplaceProducts( allProducts ?? [] );
		return showPressableAddons
			? marketplaceProducts
			: marketplaceProducts.filter( ( product ) => ! isPressableAddon( product ) );
	}, [ allProducts, showPressableAddons ] );

	const searchParams = marketplaceProductsRoute.useSearch() as ProductsSearchParams;
	const { items: cartItems, hasItem, addItem, removeItem, clearCart } = useShoppingCart();
	const [ view, setView ] = useState< View >( () => ( {
		...DEFAULT_VIEW,
		search: searchParams.search_query != null ? String( searchParams.search_query ) : '',
	} ) );
	const [ selectedTile, setSelectedTile ] = useState< CategoryTileValue | null >( () => {
		const category = searchParams.category
			? CLASSIC_CATEGORY_KEYS[ searchParams.category ] ?? searchParams.category
			: null;
		return isCategoryTileValue( category ) ? category : null;
	} );
	const showPressableTile = showPressableAddons && products.some( isPressableAddon );
	const tileCategory = selectedTile === 'pressable' && ! showPressableTile ? null : selectedTile;

	// `?product_slug=a,b` replaces the cart with those products; `?products=a:1,b:1` adds them.
	const hasPreselected = useRef( false );
	useEffect( () => {
		if ( hasPreselected.current || ! allProducts ) {
			return;
		}
		const slugs = searchParams.product_slug
			? searchParams.product_slug.split( ',' )
			: ( searchParams.products ?? '' )
					.split( ',' )
					.map( ( entry ) => entry.split( ':' )[ 0 ] )
					.filter( Boolean );
		if ( slugs.length === 0 ) {
			return;
		}
		hasPreselected.current = true;
		if ( searchParams.product_slug ) {
			clearCart();
		}
		slugs
			.filter( ( slug ) => allProducts.some( ( product ) => product.slug === slug ) )
			.forEach( addItem );
	}, [ allProducts, searchParams.product_slug, searchParams.products, clearCart, addItem ] );
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
				filterBy: { operators: [ 'isAny' ] },
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
	}, [] );

	const tileProducts = useMemo(
		() =>
			tileCategory
				? products.filter( ( product ) =>
						[ getProductBrand( product ), ...getProductFilterCategories( product ) ].includes(
							tileCategory
						)
				  )
				: products,
		[ products, tileCategory ]
	);
	const { data: filteredProducts } = useMemo(
		() => filterSortAndPaginate( tileProducts, view, fields ),
		[ tileProducts, view, fields ]
	);
	// Every section stays while searching or filtering, each showing only its
	// matching products, as the classic dashboard does.
	const locale = useIntlLocale();
	const sections = useMemo(
		() => getProductSections( filteredProducts, locale ),
		[ filteredProducts, locale ]
	);

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

	const handleTileSelect = ( category: CategoryTileValue | null ) => {
		if ( category ) {
			recordTracksEvent( 'calypso_a4a_marketplace_product_category_selected', { category } );
		}
		setSelectedTile( category );
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
		<Grid templateColumns="repeat( auto-fill, minmax( 280px, 1fr ) )" gap={ 6 }>
			{ items.map( ( item ) => (
				<ProductCard
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

	const wooPayments = products.find( ( product ) => product.slug === WOOPAYMENTS_PRODUCT_SLUG );
	const renderWooPaymentsBanner = () => {
		if ( ! wooPayments ) {
			return null;
		}
		const inCart = hasItem( wooPayments.slug );
		const copy = getWooPaymentsCardCopy();
		return (
			<Callout
				title={ copy.title }
				titleAs="h3"
				description={ <Text variant="muted">{ copy.description }</Text> }
				image={ <WooPaymentsIllustration title={ __( 'A client store using WooPayments' ) } /> }
				imageVariant="full-bleed"
				actions={
					<ButtonStack justify="flex-start">
						<Button
							variant="secondary"
							size="compact"
							icon={ inCart ? check : undefined }
							onClick={ () => toggleCart( wooPayments ) }
						>
							{ getCartActionLabel( isReferralMode, inCart ) }
						</Button>
						<Button variant="link" onClick={ () => openDetails( wooPayments ) }>
							{ __( 'View details' ) }
						</Button>
					</ButtonStack>
				}
			/>
		);
	};

	return (
		<PageLayout
			header={
				<PageHeader
					title={ __( 'Products' ) }
					description={ __(
						'Extensions, plans, and add-ons for your clients’ sites. Buy for your agency or refer them to a client.'
					) }
					actions={
						<div className="dashboard-marketplace-products__header-actions">
							<ReferralToggle />
							<CartMenu
								items={ cartItems }
								products={ allProducts ?? [] }
								term={ termPricing }
								isReferralMode={ isReferralMode }
								isAgencyApproved={ isAgencyApproved }
								onRemove={ removeItem }
							/>
						</div>
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
			<CategoryTiles
				selected={ tileCategory }
				showPressable={ showPressableTile }
				onSelect={ handleTileSelect }
			/>
			<div className="dashboard-marketplace-products__filters">
				<DataViews< AgencyProduct >
					data={ tileProducts }
					getItemId={ ( item ) => item.slug }
					fields={ fields }
					view={ view }
					onChangeView={ handleViewChange }
					paginationInfo={ { totalItems: tileProducts.length, totalPages: 1 } }
					defaultLayouts={ { list: {} } }
					search
				>
					<HStack justify="space-between" className="dashboard-marketplace-products__toolbar">
						<HStack justify="flex-start" expanded={ false }>
							<DataViews.Search />
							<DataViews.FiltersToggle />
						</HStack>
						<TermPricingToggle />
					</HStack>
					<Spacer marginBottom={ 4 }>
						<DataViews.FiltersToggled />
					</Spacer>
				</DataViews>
			</div>
			{ isLoading && (
				<Grid templateColumns="repeat( auto-fill, minmax( 280px, 1fr ) )" gap={ 6 }>
					{ Array.from( { length: 4 }, ( _, index ) => (
						<ProductCardSkeleton key={ index } />
					) ) }
				</Grid>
			) }
			{ ! isLoading && sections.length === 0 && (
				<VStack spacing={ 1 }>
					<Text weight={ 500 }>{ __( 'Sorry, no results found.' ) }</Text>
					<Text variant="muted">
						{ __(
							'Please try refining your search and filtering to find what you’re looking for.'
						) }
					</Text>
				</VStack>
			) }
			{ ! isLoading && (
				<VStack spacing={ 10 }>
					{ sections.map( ( section ) => (
						<VStack key={ section.key } spacing={ 4 }>
							<SectionHeader
								level={ 2 }
								title={ section.title }
								description={ section.description }
								decoration={
									section.brand ? (
										<img
											src={ BRAND_MARKS[ section.brand ] }
											alt=""
											className="dashboard-marketplace-products__section-mark"
										/>
									) : undefined
								}
							/>
							{ section.key === 'featured' &&
								section.items.some(
									( item ) => getItemProducts( item )[ 0 ].slug === WOOPAYMENTS_PRODUCT_SLUG
								) &&
								renderWooPaymentsBanner() }
							{ renderGrid(
								section.key === 'featured'
									? section.items.filter(
											( item ) => getItemProducts( item )[ 0 ].slug !== WOOPAYMENTS_PRODUCT_SLUG
									  )
									: section.items
							) }
						</VStack>
					) ) }
				</VStack>
			) }
		</PageLayout>
	);
}
