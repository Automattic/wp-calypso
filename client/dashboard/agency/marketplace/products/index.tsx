import {
	Button,
	Dropdown,
	ExternalLink,
	ToggleControl,
	__experimentalGrid as Grid,
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalSpacer as Spacer,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __, _n, sprintf } from '@wordpress/i18n';
import { cart, check, info } from '@wordpress/icons';
import { useMemo, useState } from 'react';
import { ButtonStack } from '../../../components/button-stack';
import { Callout } from '../../../components/callout';
import { Notice } from '../../../components/notice';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import { SectionHeader } from '../../../components/section-header';
import WooPaymentsIllustration from '../../overview/woopayments-illustration';
import jetpackLogo from '../exclusive-offers/images/jetpack-descriptor.svg';
import wooLogo from '../exclusive-offers/images/woo-descriptor.svg';
import { formatUSD } from '../hosting/mock-data';
import CategoryTiles from './category-tiles';
import {
	CATALOG,
	FEATURED_SLUGS,
	KIND_LABEL,
	priceFor,
	PRODUCT_REFERRAL_COMMISSION_RATE,
	WOOPAYMENTS_CARD,
} from './mock-data';
import ProductCard from './product-card';
import ProductDetails from './product-details';
import type { CatalogProduct } from './mock-data';
import type { Field, View } from '@wordpress/dataviews';

import './style.scss';

// Main's fixed section order and copy (products-overview/product-listing).
// Cart button label: purchase vs. referral wording, added vs. not.
function cartLabel( referral: boolean, added: boolean ): string {
	if ( referral ) {
		return added ? __( 'Added to referral' ) : __( 'Add to referral' );
	}
	return added ? __( 'Added to cart' ) : __( 'Add to cart' );
}

const SECTIONS: {
	key: string;
	title: string;
	description?: string;
	mark?: string;
	pick: ( p: CatalogProduct ) => boolean;
	sort?: ( a: CatalogProduct, b: CatalogProduct ) => number;
}[] = [
	{
		key: 'featured',
		title: __( 'Featured products' ),
		// WooPayments is the section's banner (Main's custom card), not a grid card.
		pick: ( p ) => FEATURED_SLUGS.includes( p.slug ) && p.slug !== WOOPAYMENTS_CARD.slug,
		sort: ( a, b ) => FEATURED_SLUGS.indexOf( a.slug ) - FEATURED_SLUGS.indexOf( b.slug ),
	},
	{
		key: 'woo',
		title: __( 'WooCommerce extensions' ),
		mark: wooLogo,
		description: __(
			"Explore the tools and integrations you need to grow your client's Woo store."
		),
		pick: ( p ) => p.family.startsWith( 'woocommerce' ),
		sort: ( a, b ) => a.name.localeCompare( b.name ),
	},
	{
		key: 'jetpack-plans',
		title: __( 'Jetpack plans' ),
		mark: jetpackLogo,
		description: __(
			'Save big with comprehensive bundles of Jetpack security, performance, and growth tools.'
		),
		pick: ( p ) => p.family === 'jetpack-packs',
	},
	{
		key: 'jetpack-products',
		title: __( 'Jetpack products' ),
		mark: jetpackLogo,
		description: __(
			'Mix and match powerful security, performance, and growth tools for your sites.'
		),
		pick: ( p ) => p.family === 'jetpack-products',
		sort: ( a, b ) => a.name.localeCompare( b.name ),
	},
	{
		key: 'backup-addons',
		title: __( 'Jetpack VaultPress Backup add-ons' ),
		mark: jetpackLogo,
		description: __( 'Add additional storage to your current VaultPress Backup plans.' ),
		pick: ( p ) => p.family === 'jetpack-backup-storage',
		sort: ( a, b ) => a.productId - b.productId,
	},
];

// Main's category menu + filter groups, as DataViews filters. The tiles are the
// category entry point; every filter sits behind the toggle and shows as a
// chip only once set (Exclusive Offers' behaviour).
const CATEGORY_OPTIONS = [
	'Jetpack',
	'WooCommerce',
	'Payments',
	'Security',
	'Performance',
	'Social',
	'Growth',
	'Shipping',
	'Conversion',
	'Customer service',
	'Merchandising',
	'Store content',
	'Store management',
].map( ( label ) => ( { value: label, label } ) );

const brandOf = ( p: CatalogProduct ) =>
	p.family.startsWith( 'jetpack' ) ? 'Jetpack' : 'WooCommerce';

const initialView: View = {
	type: 'list',
	fields: [],
	search: '',
	filters: [],
	page: 1,
	perPage: 200,
};

interface CartItem {
	slug: string;
	label: string;
	total: number;
	commission?: number;
}

function CartDropdown( {
	items,
	term,
	onRemove,
}: {
	items: CartItem[];
	term: 'monthly' | 'yearly';
	onRemove: ( slug: string ) => void;
} ) {
	const total = items.reduce( ( sum, item ) => sum + item.total, 0 );
	const commission = items.reduce( ( sum, item ) => sum + ( item.commission ?? 0 ), 0 );
	/* translators: %s is a formatted price, e.g. US$600.00 */
	const perYear = __( '%s/yr' );
	/* translators: %s is a formatted price, e.g. US$50.00 */
	const perMonth = __( '%s/mo' );
	const per = term === 'yearly' ? perYear : perMonth;
	return (
		<Dropdown
			popoverProps={ { placement: 'bottom-end' } }
			renderToggle={ ( { isOpen, onToggle } ) => (
				<Button
					icon={ cart }
					label={ __( 'Shopping cart' ) }
					aria-expanded={ isOpen }
					onClick={ onToggle }
					text={ items.length > 0 ? String( items.length ) : undefined }
				/>
			) }
			renderContent={ () => (
				<VStack spacing={ 3 } className="marketplace-products__cart">
					<Heading level={ 3 } size={ 13 }>
						{ __( 'Cart' ) }
					</Heading>
					{ items.length === 0 && <Text variant="muted">{ __( 'Your cart is empty.' ) }</Text> }
					{ items.map( ( item ) => (
						<HStack key={ item.slug } justify="space-between" spacing={ 4 }>
							<Text>{ item.label }</Text>
							<HStack spacing={ 3 } justify="flex-end" expanded={ false }>
								<Text>{ formatUSD( item.total ) }</Text>
								<Button variant="link" isDestructive onClick={ () => onRemove( item.slug ) }>
									{ __( 'Remove' ) }
								</Button>
							</HStack>
						</HStack>
					) ) }
					{ items.length > 0 && (
						<>
							<HStack justify="space-between">
								<Text weight={ 600 }>
									{ term === 'yearly' ? __( 'Total per year' ) : __( 'Total per month' ) }
								</Text>
								<Text weight={ 600 }>{ formatUSD( total ) }</Text>
							</HStack>
							{ commission > 0 && (
								<HStack justify="space-between">
									<Text variant="muted">{ __( 'Your estimated commission:' ) }</Text>
									<Text variant="muted">{ sprintf( per, formatUSD( commission ) ) }</Text>
								</HStack>
							) }
							<Button variant="primary" __next40pxDefaultSize>
								{ __( 'Proceed to checkout' ) }
							</Button>
						</>
					) }
				</VStack>
			) }
		/>
	);
}

export default function MarketplaceProducts() {
	const [ view, setView ] = useState< View >( initialView );
	// The tiles filter outside DataViews' own filter state: pushing a filter into
	// the view makes DataViews open its filter UI and popover, which is right for
	// "Add filter" and wrong for a tile.
	// Prototype-only screenshot flags: `?refer`, `?details=<slug>`, `?category=<label>`.
	const shotParams = new URLSearchParams( window.location.search );
	const [ tileCategory, setTileCategory ] = useState< string | null >(
		shotParams.get( 'category' )
	);
	const [ term, setTerm ] = useState< 'monthly' | 'yearly' >( 'yearly' );
	// The catalog has no annual discount (yearly = 12 × monthly), so the toggle
	// is a cadence switch, labelled as one. On = billed annually (Main's default).
	const showTermToggle = true;
	const [ isReferralMode, setIsReferralMode ] = useState( shotParams.has( 'refer' ) );
	const showReferralNotice = new URLSearchParams( window.location.search ).has( 'referralnotice' );
	// Dismissable for the current stint in referral mode only: turning the mode
	// back on brings the notice back, so the cue can't be lost for good.
	const [ isNoticeDismissed, setIsNoticeDismissed ] = useState( false );
	const [ cartItems, setCartItems ] = useState< CartItem[] >( [] );
	const [ details, setDetails ] = useState< CatalogProduct | null >(
		() => CATALOG.find( ( p ) => p.slug === shotParams.get( 'details' ) ) ?? null
	);

	const fields: Field< CatalogProduct >[] = useMemo(
		() => [
			{ id: 'name', getValue: ( { item } ) => item.name, enableGlobalSearch: true },
			{ id: 'description', getValue: ( { item } ) => item.description, enableGlobalSearch: true },
			{
				id: 'category',
				label: __( 'Category' ),
				type: 'text',
				getValue: ( { item } ) => [ brandOf( item ), ...item.categories ],
				elements: CATEGORY_OPTIONS,
				filterBy: { operators: [ 'isAny' ] },
				enableSorting: false,
				enableHiding: true,
			},
			{
				id: 'vendor',
				label: __( 'Developed by' ),
				type: 'text',
				getValue: ( { item } ) => item.vendorName,
				elements: Array.from( new Set( CATALOG.map( ( p ) => p.vendorName ) ) )
					.sort()
					.map( ( v ) => ( { value: v, label: v } ) ),
				filterBy: { operators: [ 'is' ] },
				enableSorting: false,
				enableHiding: true,
			},
			{
				id: 'kind',
				label: __( 'Type' ),
				type: 'text',
				getValue: ( { item } ) => KIND_LABEL[ item.kind ],
				elements: Object.values( KIND_LABEL ).map( ( v ) => ( { value: v, label: v } ) ),
				filterBy: { operators: [ 'is' ] },
				enableSorting: false,
				enableHiding: true,
			},
			{
				id: 'price',
				label: __( 'Price' ),
				type: 'text',
				getValue: ( { item } ) => ( priceFor( item, 'yearly' ).charge > 0 ? 'Paid' : 'Free' ),
				elements: [
					{ value: 'Free', label: __( 'Free' ) },
					{ value: 'Paid', label: __( 'Paid' ) },
				],
				filterBy: { operators: [ 'is' ] },
				enableSorting: false,
				enableHiding: true,
			},
		],
		[]
	);

	const tileData = useMemo(
		() =>
			tileCategory
				? CATALOG.filter( ( p ) => [ brandOf( p ), ...p.categories ].includes( tileCategory ) )
				: CATALOG,
		[ tileCategory ]
	);
	const { data: filtered } = useMemo(
		() => filterSortAndPaginate( tileData, view, fields ),
		[ tileData, view, fields ]
	);
	const isNarrowed =
		tileCategory !== null || view.search !== '' || ( view.filters?.length ?? 0 ) > 0;

	const inCart = ( slug: string ) => cartItems.some( ( item ) => item.slug === slug );
	const toggleCart = ( product: CatalogProduct ) => {
		setCartItems( ( current ) => {
			if ( current.some( ( item ) => item.slug === product.slug ) ) {
				return current.filter( ( item ) => item.slug !== product.slug );
			}
			const { charge } = priceFor( product, term );
			return [
				...current,
				{
					slug: product.slug,
					label: product.name,
					total: charge,
					commission: isReferralMode ? charge * PRODUCT_REFERRAL_COMMISSION_RATE : undefined,
				},
			];
		} );
	};

	// Main's custom WooPayments card, in the Hosting page's Callout grammar (the
	// dev-sites banner), with the Overview's WooPayments storefront illustration.
	const wooPayments = CATALOG.find( ( p ) => p.slug === WOOPAYMENTS_CARD.slug );
	const renderWooPaymentsBanner = () =>
		wooPayments ? (
			<Callout
				title={ WOOPAYMENTS_CARD.title }
				titleAs="h3"
				description={ <Text variant="muted">{ WOOPAYMENTS_CARD.description }</Text> }
				image={ <WooPaymentsIllustration title={ __( 'A client store using WooPayments' ) } /> }
				imageVariant="full-bleed"
				actions={
					<ButtonStack style={ { justifyContent: 'flex-start' } }>
						<Button
							variant="secondary"
							size="compact"
							icon={ inCart( wooPayments.slug ) ? check : undefined }
							onClick={ () => toggleCart( wooPayments ) }
						>
							{ cartLabel( isReferralMode, inCart( wooPayments.slug ) ) }
						</Button>
						<Button variant="link" onClick={ () => setDetails( wooPayments ) }>
							{ __( 'View details' ) }
						</Button>
					</ButtonStack>
				}
			/>
		) : null;

	const renderGrid = ( products: CatalogProduct[] ) => (
		<Grid templateColumns="repeat( auto-fill, minmax( 280px, 1fr ) )" gap={ 8 }>
			{ products.map( ( product ) => (
				<ProductCard
					key={ product.slug }
					product={ product }
					term={ term }
					isReferralMode={ isReferralMode }
					inCart={ inCart( product.slug ) }
					onToggleCart={ () => toggleCart( product ) }
					onDetails={ () => setDetails( product ) }
				/>
			) ) }
		</Grid>
	);

	return (
		<PageLayout
			header={
				<PageHeader
					title={ __( 'Products' ) }
					description={ __(
						'Extensions, plans, and add-ons for your clients’ sites. Buy for your agency or refer them to a client.'
					) }
					actions={
						<div className="marketplace-products__header-actions">
							<HStack spacing={ 1 } justify="flex-start" expanded={ false }>
								<ToggleControl
									__nextHasNoMarginBottom
									checked={ isReferralMode }
									label={ __( 'Refer products' ) }
									onChange={ ( checked ) => {
										setIsReferralMode( checked );
										setIsNoticeDismissed( false );
									} }
								/>
								<Button
									icon={ info }
									size="small"
									label={ __( 'Learn how referral mode works' ) }
								/>
							</HStack>
							<CartDropdown
								items={ cartItems }
								term={ term }
								onRemove={ ( slug ) =>
									setCartItems( ( current ) => current.filter( ( item ) => item.slug !== slug ) )
								}
							/>
						</div>
					}
				/>
			}
		>
			{ isReferralMode && showReferralNotice && ! isNoticeDismissed && (
				<Notice
					variant="info"
					title={ __( 'Referral mode is on' ) }
					onClose={ () => setIsNoticeDismissed( true ) }
					actions={
						<ExternalLink href="https://agencieshelp.automattic.com/knowledge-base/referring-products-to-clients/">
							{ __( 'How referrals work' ) }
						</ExternalLink>
					}
				>
					{ __(
						'Your client is billed directly at the retail price. You earn commission on every payment they make, paid out quarterly.'
					) }
				</Notice>
			) }
			{ details && (
				<ProductDetails
					product={ details }
					term={ term }
					isReferralMode={ isReferralMode }
					inCart={ inCart( details.slug ) }
					onToggleCart={ () => toggleCart( details ) }
					onClose={ () => setDetails( null ) }
				/>
			) }
			<CategoryTiles selected={ tileCategory } onSelect={ setTileCategory } />
			<div className="marketplace-products__dataviews">
				<DataViews< CatalogProduct >
					data={ tileData }
					getItemId={ ( item ) => item.slug }
					fields={ fields }
					view={ view }
					onChangeView={ setView }
					paginationInfo={ { totalItems: tileData.length, totalPages: 1 } }
					defaultLayouts={ { list: {} } }
					search
				>
					<HStack justify="space-between" className="marketplace-products__toolbar">
						<HStack justify="flex-start" expanded={ false }>
							<DataViews.Search />
							<DataViews.FiltersToggle />
						</HStack>
						{ showTermToggle && (
							<ToggleControl
								__nextHasNoMarginBottom
								checked={ term === 'yearly' }
								label={ __( 'Billed annually' ) }
								onChange={ ( checked ) => setTerm( checked ? 'yearly' : 'monthly' ) }
							/>
						) }
					</HStack>
					<Spacer marginBottom={ 4 }>
						<DataViews.FiltersToggled />
					</Spacer>
				</DataViews>
			</div>
			{ isNarrowed ? (
				<VStack spacing={ 4 }>
					<SectionHeader
						level={ 2 }
						title={ sprintf(
							/* translators: %d: number of matching products */
							_n( '%d product', '%d products', filtered.length ),
							filtered.length
						) }
					/>
					{ filtered.length === 0 ? (
						<VStack spacing={ 1 }>
							<Text weight={ 500 }>{ __( 'Sorry, no results found.' ) }</Text>
							<Text variant="muted">
								{ __(
									"Please try refining your search and filtering to find what you're looking for."
								) }
							</Text>
						</VStack>
					) : (
						renderGrid( filtered )
					) }
				</VStack>
			) : (
				<VStack spacing={ 10 }>
					{ SECTIONS.map( ( section ) => {
						const products = CATALOG.filter( section.pick ).sort( section.sort ?? ( () => 0 ) );
						if ( ! products.length ) {
							return null;
						}
						return (
							<VStack key={ section.key } spacing={ 4 }>
								<SectionHeader
									className="marketplace-products__section-header"
									level={ 2 }
									title={ section.title }
									description={ section.description }
									decoration={
										section.mark ? (
											<img src={ section.mark } alt="" className="marketplace-products__mark" />
										) : undefined
									}
								/>
								{ section.key === 'featured' && renderWooPaymentsBanner() }
								{ renderGrid( products ) }
							</VStack>
						);
					} ) }
				</VStack>
			) }
		</PageLayout>
	);
}
