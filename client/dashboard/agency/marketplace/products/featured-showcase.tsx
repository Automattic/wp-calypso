import { formatCurrency } from '@automattic/number-formatters';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
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

// Each job's drawing (see images/showcase).
const CATEGORY_DRAWINGS: Record< ProductCategory, string > = {
	payments: 'payment',
	merchandising: 'kit',
	shipping: 'rates',
	conversion: 'points',
	'customer-service': 'tracking',
	growth: 'stats',
	performance: 'speed',
	security: 'scan',
	social: 'social',
	'store-content': 'product',
	'store-management': 'orders',
};

// Products whose own drawing says more than their job's.
const PRODUCT_DRAWINGS: Record< string, string > = {
	'woocommerce-gift-cards': 'gift-cards-woo',
	'jetpack-ai': 'ai-answer-jetpack',
	'jetpack-videopress': 'video-player-jetpack',
};

function getProductDrawing( product: AgencyProduct ): string | undefined {
	if ( PRODUCT_DRAWINGS[ product.slug ] ) {
		return PRODUCT_IMAGES[ PRODUCT_DRAWINGS[ product.slug ] ];
	}
	if ( product.family_slug === BACKUP_STORAGE_FAMILY_SLUG ) {
		return PRODUCT_IMAGES[ 'storage-jetpack' ];
	}
	const category = getProductCategories( product )[ 0 ];
	return category
		? PRODUCT_IMAGES[ `${ CATEGORY_DRAWINGS[ category ] }-${ getProductMaker( product.slug ) }` ]
		: undefined;
}

function getPriceLine( product: AgencyProduct, term: TermPricing ) {
	const priceInfo = getProductPriceInfo( product, term );
	return priceInfo.isFree
		? __( 'Free' )
		: `${ formatCurrency( priceInfo.price, product.currency ) } ${ priceInfo.intervalLabel }`;
}

interface Props {
	products: AgencyProduct[];
	term: TermPricing;
	isReferralMode: boolean;
	isInCart: ( slug: string ) => boolean;
	onToggleCart: ( product: AgencyProduct ) => void;
	onViewDetails: ( product: AgencyProduct ) => void;
}

/**
 * The featured products on the shared showcase (A4AD-237): each tile shows the
 * product at work in a client's store, drawn in Figma.
 */
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
				<div className="dashboard-marketplace-products__featured-fallback">
					<ProductTile slug={ product.slug } />
					<span>{ getProductShortTitle( product ) }</span>
				</div>
			),
			action: (
				<Button
					variant="secondary"
					size="compact"
					icon={ inCart ? check : undefined }
					aria-pressed={ inCart }
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
			onOpen: () => onViewDetails( product ),
		};
	} );

	return <Showcase items={ items } />;
}
