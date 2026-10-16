import {
	Button,
	SelectControl,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { check } from '@wordpress/icons';
import { useState } from 'react';
import BodyCard from '../../components/showcase/body-card';
import { getPressableMemoryTarget, isPressablePhpMemoryAddon } from './lib/pressable-memory-addon';
import { getCartActionLabel } from './lib/product-copy';
import { getProductDescription } from './lib/product-descriptions';
import { getItemProducts } from './lib/product-groups';
import { getProductPriceInfo, getTermAvailabilityNote } from './lib/product-pricing';
import { BACKUP_STORAGE_FAMILY_SLUG } from './lib/product-slugs';
import { getProductListTitle, getProductShortTitle } from './lib/product-title';
import { getVendorInfo } from './lib/vendor-info';
import ProductPrice from './product-price';
import ProductTile from './product-tile';
import type { TermPricing } from '../use-term-pricing';
import type { ProductListItem } from './lib/product-groups';
import type { AgencyProduct } from '@automattic/api-core';

interface ProductStoreCardProps {
	item: ProductListItem;
	term: TermPricing;
	isReferralMode: boolean;
	isInCart: ( product: AgencyProduct ) => boolean;
	onToggleCart: ( product: AgencyProduct ) => void;
	onViewDetails: ( product: AgencyProduct ) => void;
	onSelectVariant?: ( product: AgencyProduct ) => void;
}

// The products API returns a PHP memory add-on once per Pressable site, so its
// card names the site where others name their maker. Unlike the description,
// the byline is never clamped.
function getCardByline( product: AgencyProduct ) {
	if ( isPressablePhpMemoryAddon( product ) ) {
		const memoryTarget = getPressableMemoryTarget( product );
		return memoryTarget
			? sprintf(
					/* translators: %(siteDomain)s is the Pressable site the add-on applies to. */
					__( 'Applies to %(siteDomain)s.' ),
					{ siteDomain: memoryTarget }
				)
			: __( 'Applies to one Pressable site/domain.' );
	}
	const vendorName = getVendorInfo( product.slug )?.vendorName;
	return vendorName
		? sprintf(
				/* translators: %s is the name of the company that makes the product. */
				__( 'by %s' ),
				vendorName
			)
		: undefined;
}

export default function ProductStoreCard( {
	item,
	term,
	isReferralMode,
	isInCart,
	onToggleCart,
	onViewDetails,
	onSelectVariant,
}: ProductStoreCardProps ) {
	const variants = getItemProducts( item );
	const [ selectedSlug, setSelectedSlug ] = useState( variants[ 0 ].slug );
	const product = variants.find( ( variant ) => variant.slug === selectedSlug ) ?? variants[ 0 ];

	const inCart = isInCart( product );
	const termNote = getTermAvailabilityNote( product, term );
	// The backup storage add-ons have no details to show.
	const canViewDetails = product.family_slug !== BACKUP_STORAGE_FAMILY_SLUG;

	return (
		<BodyCard
			title={ getProductListTitle( product, variants.length > 1 ) }
			byline={ getCardByline( product ) }
			description={ getProductDescription( product.slug ).description ?? undefined }
			tile={ <ProductTile product={ product } /> }
			actions={
				<>
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
					<VStack spacing={ 1 }>
						<ProductPrice
							priceInfo={ getProductPriceInfo( product, term ) }
							currency={ product.currency }
						/>
						{ termNote && (
							<Text variant="muted" size={ 12 }>
								{ termNote }
							</Text>
						) }
					</VStack>
					<HStack
						spacing={ 4 }
						justify="flex-start"
						expanded={ false }
						wrap
						className="dashboard-marketplace-products__card-actions"
					>
						<Button
							variant="secondary"
							size="compact"
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
					</HStack>
				</>
			}
		/>
	);
}
