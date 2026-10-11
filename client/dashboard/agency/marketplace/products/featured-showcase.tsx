import { formatCurrency } from '@automattic/number-formatters';
import {
	Button,
	__experimentalHStack as HStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { check, plugins } from '@wordpress/icons';
import Showcase from '../../components/showcase';
import woopaymentsLogo from '../exclusive-offers/images/woopayments.svg';
import { CATEGORY_ICONS } from './category-tiles';
import { PRODUCT_IMAGES } from './images/showcase';
import {
	getCategoryShortLabels,
	getProductCategories,
	getProductType,
	getTypeLabels,
} from './lib/product-categories';
import { getCartActionLabel, getWooPaymentsCardCopy } from './lib/product-copy';
import { getProductDescription } from './lib/product-descriptions';
import { getProductMaker } from './lib/product-maker';
import { getProductPriceInfo } from './lib/product-pricing';
import { BACKUP_STORAGE_FAMILY_SLUG, WOOPAYMENTS_PRODUCT_SLUG } from './lib/product-slugs';
import { getProductShortTitle } from './lib/product-title';
import ProductTile from './product-tile';
import type { TermPricing } from '../use-term-pricing';
import type { ProductCategory } from './lib/product-categories';
import type { ShowcaseItem } from '../../components/showcase';
import type { AgencyProduct } from '@automattic/api-core';

const CATEGORY_DRAWINGS: Partial< Record< ProductCategory, string > > = {
	payments: 'payment',
	merchandising: 'kit',
	shipping: 'rates',
	conversion: 'points',
	'customer-service': 'tracking',
};

// Products whose own drawing says more than their job's.
const PRODUCT_DRAWINGS: Record< string, string > = {
	'woocommerce-gift-cards': 'gift-cards-woo',
};

function getProductDrawing( product: AgencyProduct ): string | undefined {
	if ( PRODUCT_DRAWINGS[ product.slug ] ) {
		return PRODUCT_IMAGES[ PRODUCT_DRAWINGS[ product.slug ] ];
	}
	const category = getProductCategories( product )[ 0 ];
	const drawing = category && CATEGORY_DRAWINGS[ category ];
	return drawing
		? PRODUCT_IMAGES[ `${ drawing }-${ getProductMaker( product.slug ) }` ]
		: undefined;
}

function getPriceLine( product: AgencyProduct, term: TermPricing ) {
	const priceInfo = getProductPriceInfo( product, term );
	return priceInfo.isFree
		? __( 'Free' )
		: sprintf(
				/* translators: %1$s is the price, %2$s the billing interval, such as "per year". */
				__( '%1$s %2$s' ),
				formatCurrency( priceInfo.price, product.currency ),
				priceInfo.intervalLabel
			);
}

interface Props {
	products: AgencyProduct[];
	term: TermPricing;
	isReferralMode: boolean;
	isInCart: ( slug: string ) => boolean;
	onToggleCart: ( product: AgencyProduct ) => void;
	onViewDetails: ( product: AgencyProduct ) => void;
}

export default function FeaturedShowcase( {
	products,
	term,
	isReferralMode,
	isInCart,
	onToggleCart,
	onViewDetails,
}: Props ) {
	const wooPaymentsCopy = getWooPaymentsCardCopy();
	const items: ShowcaseItem[] = products.map( ( product ) => {
		const drawing = getProductDrawing( product );
		const category = getProductCategories( product )[ 0 ];
		const isWooPayments = product.slug === WOOPAYMENTS_PRODUCT_SLUG;
		const inCart = isInCart( product.slug );
		return {
			id: product.slug,
			accent: getProductMaker( product.slug ),
			// Products without a job name their type instead (Plan, Add-on).
			eyebrow: category
				? getCategoryShortLabels()[ category ]
				: getTypeLabels()[ getProductType( product ) ],
			glyph: category ? CATEGORY_ICONS[ category ] : plugins,
			title: isWooPayments ? wooPaymentsCopy.title : getProductShortTitle( product ),
			lockup: isWooPayments ? { src: woopaymentsLogo, alt: 'WooPayments' } : undefined,
			description: isWooPayments
				? wooPaymentsCopy.description
				: ( getProductDescription( product.slug ).description ?? undefined ),
			meta: getPriceLine( product, term ),
			art: drawing ? (
				<img className="dashboard-showcase__image" src={ drawing } alt="" />
			) : (
				<HStack
					spacing={ 3 }
					justify="flex-start"
					expanded={ false }
					className="dashboard-marketplace-products__featured-fallback"
				>
					<ProductTile product={ product } />
					<Text size={ 13 } weight={ 600 }>
						{ getProductShortTitle( product ) }
					</Text>
				</HStack>
			),
			action: (
				<Button
					variant="secondary"
					size="compact"
					icon={ inCart ? check : undefined }
					onClick={ () => onToggleCart( product ) }
				>
					{ getCartActionLabel( isReferralMode, inCart ) }
				</Button>
			),
			secondaryAction:
				product.family_slug !== BACKUP_STORAGE_FAMILY_SLUG ? (
					<Button variant="link" onClick={ () => onViewDetails( product ) }>
						{ __( 'View details' ) }
					</Button>
				) : undefined,
		};
	} );

	return (
		<Showcase
			title={ __( 'Featured plugins and add-ons' ) }
			arrowLabels={ {
				previous: __( 'Previous featured plugins and add-ons' ),
				next: __( 'Next featured plugins and add-ons' ),
			} }
			items={ items }
		/>
	);
}
