import {
	Button,
	SelectControl,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { check } from '@wordpress/icons';
import { Badge } from '@wordpress/ui';
import { useState } from 'react';
import { ButtonStack } from '../../../components/button-stack';
import { Card, CardBody } from '../../../components/card';
import jetpackLogo from '../exclusive-offers/images/jetpack-descriptor.svg';
import pressableLogo from '../exclusive-offers/images/pressable-descriptor.svg';
import wooLogo from '../exclusive-offers/images/woo-descriptor.svg';
import woopaymentsLogo from '../exclusive-offers/images/woopayments.svg';
import { getProductBadgeLabels, getProductBrand } from './lib/product-categories';
import { getProductDescription } from './lib/product-descriptions';
import { getItemProducts } from './lib/product-groups';
import { getProductPriceInfo, getTermAvailabilityNote } from './lib/product-pricing';
import { BACKUP_STORAGE_FAMILY_SLUG, WOOPAYMENTS_PRODUCT_SLUG } from './lib/product-slugs';
import { getProductShortTitle } from './lib/product-title';
import ProductPrice from './product-price';
import type { ProductListItem } from './lib/product-groups';
import type { TermPricing } from '../use-term-pricing';
import type { AgencyProduct } from '@automattic/api-core';

const BRAND_MARKS = {
	jetpack: jetpackLogo,
	woocommerce: wooLogo,
	pressable: pressableLogo,
};

export const getWooPaymentsCardCopy = () => ( {
	title: __( 'Revenue share available' ),
	description: __(
		'Accept credit/debit cards and local payment options with no setup or monthly fees. Earn revenue share on transactions from your clients’ sites within Automattic for Agencies.'
	),
} );

export function getCartActionLabel( isReferralMode: boolean, inCart: boolean ): string {
	if ( isReferralMode ) {
		return inCart ? __( 'Added to referral' ) : __( 'Add to referral' );
	}
	return inCart ? __( 'Added to cart' ) : __( 'Add to cart' );
}

interface Props {
	item: ProductListItem;
	term: TermPricing;
	isReferralMode: boolean;
	isInCart: ( slug: string ) => boolean;
	onToggleCart: ( product: AgencyProduct ) => void;
	onViewDetails: ( product: AgencyProduct ) => void;
	onSelectVariant?: ( product: AgencyProduct ) => void;
}

export default function ProductCard( {
	item,
	term,
	isReferralMode,
	isInCart,
	onToggleCart,
	onViewDetails,
	onSelectVariant,
}: Props ) {
	const variants = getItemProducts( item );
	const [ selectedSlug, setSelectedSlug ] = useState( variants[ 0 ].slug );
	const product = variants.find( ( variant ) => variant.slug === selectedSlug ) ?? variants[ 0 ];

	const isWooPayments = product.slug === WOOPAYMENTS_PRODUCT_SLUG;
	const inCart = isInCart( product.slug );
	const priceInfo = getProductPriceInfo( product, term );
	const termNote = getTermAvailabilityNote( product, term );
	const { description } = getProductDescription( product.slug );
	const wooPaymentsCopy = getWooPaymentsCardCopy();
	const canViewDetails = product.family_slug !== BACKUP_STORAGE_FAMILY_SLUG;

	return (
		<Card className="dashboard-marketplace-products__card">
			<CardBody className="dashboard-marketplace-products__card-body">
				<VStack
					spacing={ 3 }
					justify="flex-start"
					className="dashboard-marketplace-products__card-main"
				>
					<HStack spacing={ 2 } justify="space-between" alignment="flex-start">
						<img
							src={ isWooPayments ? woopaymentsLogo : BRAND_MARKS[ getProductBrand( product ) ] }
							alt=""
							className={
								isWooPayments
									? 'dashboard-marketplace-products__card-logo'
									: 'dashboard-marketplace-products__card-mark'
							}
						/>
						<HStack spacing={ 1 } justify="flex-end" wrap expanded={ false }>
							{ getProductBadgeLabels( product ).map( ( label ) => (
								<Badge key={ label }>{ label }</Badge>
							) ) }
						</HStack>
					</HStack>
					<VStack spacing={ 1 }>
						<Text weight={ 500 }>
							{ isWooPayments
								? wooPaymentsCopy.title
								: getProductShortTitle( product, variants.length > 1 ) }
						</Text>
						<Text variant="muted">
							{ isWooPayments ? wooPaymentsCopy.description : description }
						</Text>
					</VStack>
					{ variants.length > 1 && (
						<SelectControl
							__next40pxDefaultSize
							__nextHasNoMarginBottom
							label={ __( 'Select variant:' ) }
							value={ product.slug }
							options={ variants.map( ( variant ) => ( {
								label: getProductShortTitle( variant ),
								value: variant.slug,
							} ) ) }
							onChange={ ( slug ) => {
								setSelectedSlug( slug );
								const next = variants.find( ( variant ) => variant.slug === slug );
								if ( ! next ) {
									return;
								}
								if ( inCart ) {
									onToggleCart( product );
									onToggleCart( next );
								}
								onSelectVariant?.( next );
							} }
						/>
					) }
				</VStack>
				<VStack spacing={ 3 } className="dashboard-marketplace-products__card-footer">
					{ ! isWooPayments && (
						<VStack spacing={ 1 }>
							<ProductPrice priceInfo={ priceInfo } currency={ product.currency } />
							{ termNote && (
								<Text variant="muted" size={ 12 }>
									{ termNote }
								</Text>
							) }
						</VStack>
					) }
					<ButtonStack justify="flex-start">
						<Button
							variant="secondary"
							icon={ inCart ? check : undefined }
							onClick={ () => onToggleCart( product ) }
						>
							{ getCartActionLabel( isReferralMode, inCart ) }
						</Button>
						{ canViewDetails && (
							<Button variant="link" onClick={ () => onViewDetails( product ) }>
								{ __( 'View details' ) }
							</Button>
						) }
					</ButtonStack>
				</VStack>
			</CardBody>
		</Card>
	);
}
