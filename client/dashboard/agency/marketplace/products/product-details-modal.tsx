import {
	Button,
	ExternalLink,
	Icon,
	Modal,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { check, closeSmall, store } from '@wordpress/icons';
import { Card, CardBody } from '../../../components/card';
import jetpackLogo from '../exclusive-offers/images/jetpack-descriptor.svg';
import pressableLogo from '../exclusive-offers/images/pressable-descriptor.svg';
import wooLogo from '../exclusive-offers/images/woo-descriptor.svg';
import { getProductBrand, isWooCommerceProduct } from './lib/product-categories';
import { getProductDescription } from './lib/product-descriptions';
import { getProductBenefits, getProductRecommendedFor } from './lib/product-info';
import { getProductPriceInfo, getTermAvailabilityNote } from './lib/product-pricing';
import { WOOPAYMENTS_PRODUCT_SLUG } from './lib/product-slugs';
import { getProductTitle } from './lib/product-title';
import { getVendorInfo } from './lib/vendor-info';
import { getWooProductUrl } from './lib/woo-product-url';
import { getWooPaymentsCardCopy } from './product-card';
import ProductPrice from './product-price';
import type { TermPricing } from '../use-term-pricing';
import type { AgencyProduct } from '@automattic/api-core';

const BRAND_MARKS = {
	jetpack: jetpackLogo,
	woocommerce: wooLogo,
	pressable: pressableLogo,
};

const CLIENT_PLUGIN_HELP_URL =
	'https://agencieshelp.automattic.com/knowledge-base/the-automattic-for-agencies-client-plugin/';

interface Props {
	product: AgencyProduct;
	term: TermPricing;
	isReferralMode: boolean;
	inCart: boolean;
	onToggleCart: () => void;
	onClose: () => void;
}

export default function ProductDetailsModal( {
	product,
	term,
	isReferralMode,
	inCart,
	onToggleCart,
	onClose,
}: Props ) {
	const isWooPayments = product.slug === WOOPAYMENTS_PRODUCT_SLUG;
	const vendor = getVendorInfo( product.slug );
	const { description, features } = getProductDescription( product.slug );
	const benefits = getProductBenefits( product );
	const recommendedFor = getProductRecommendedFor( product );
	const wooUrl = isWooCommerceProduct( product ) ? getWooProductUrl( product.slug ) : null;
	const priceInfo = getProductPriceInfo( product, term );
	const termNote = getTermAvailabilityNote( product, term );

	let cta: string = inCart ? __( 'Remove from cart' ) : __( 'Add to cart' );
	if ( isReferralMode ) {
		cta = inCart ? __( 'Remove from referral' ) : __( 'Add to referral' );
	}

	return (
		<Modal
			title={ getProductTitle( product.name ) }
			onRequestClose={ onClose }
			size="large"
			className="dashboard-marketplace-products__modal"
			__experimentalHideHeader
		>
			<div className="dashboard-marketplace-products__modal-layout">
				<Button
					className="dashboard-marketplace-products__modal-close"
					icon={ closeSmall }
					label={ __( 'Close' ) }
					onClick={ onClose }
				/>
				<VStack spacing={ 6 } className="dashboard-marketplace-products__modal-main">
					<VStack spacing={ 4 }>
						<HStack spacing={ 3 } justify="flex-start" alignment="flex-start" expanded={ false }>
							<img
								src={ BRAND_MARKS[ getProductBrand( product ) ] }
								alt=""
								className="dashboard-marketplace-products__modal-mark"
							/>
							<VStack spacing={ 1 }>
								<Text size={ 20 } weight={ 600 }>
									{ getProductTitle( product.name ) }
								</Text>
								{ vendor && (
									<Text variant="muted">
										{ createInterpolateElement(
											/* translators: <a /> is the vendor name, linked to their site. */
											__( 'By <a />' ),
											{
												a: (
													<ExternalLink href={ vendor.vendorUrl }>
														{ vendor.vendorName }
													</ExternalLink>
												),
											}
										) }
									</Text>
								) }
							</VStack>
						</HStack>
						{ ( isWooPayments || description ) && (
							<Text>{ isWooPayments ? getWooPaymentsCardCopy().description : description }</Text>
						) }
					</VStack>

					{ recommendedFor.length > 0 && (
						<Card>
							<CardBody>
								<HStack spacing={ 3 } justify="flex-start" alignment="center" wrap>
									<Text weight={ 500 }>{ __( 'Great for:' ) }</Text>
									{ recommendedFor.map( ( tag ) => (
										<HStack key={ tag } spacing={ 1 } justify="flex-start" expanded={ false }>
											<Icon icon={ store } size={ 18 } />
											<Text variant="muted">{ tag }</Text>
										</HStack>
									) ) }
								</HStack>
							</CardBody>
						</Card>
					) }

					{ features.length > 0 && (
						<VStack spacing={ 2 }>
							<Text weight={ 500 }>{ __( 'Includes' ) }</Text>
							<ul className="dashboard-marketplace-products__list">
								{ features.map( ( feature ) => (
									<li key={ feature }>
										<Icon icon={ check } size={ 20 } />
										<Text variant="muted">{ feature }</Text>
									</li>
								) ) }
							</ul>
						</VStack>
					) }

					{ benefits.length > 0 && (
						<VStack spacing={ 2 }>
							<Text weight={ 500 }>{ __( 'Benefits' ) }</Text>
							<ul className="dashboard-marketplace-products__list">
								{ benefits.map( ( benefit, index ) => (
									<li key={ index }>
										<Icon icon={ check } size={ 20 } />
										<Text variant="muted">{ benefit }</Text>
									</li>
								) ) }
							</ul>
						</VStack>
					) }

					{ isWooPayments && (
						<Text variant="muted">
							{ createInterpolateElement(
								__(
									'Only sites that have the <a>Automattic for Agencies</a> plugin installed and connected are eligible for revenue share with WooPayments.'
								),
								{ a: <ExternalLink href={ CLIENT_PLUGIN_HELP_URL }>{ null }</ExternalLink> }
							) }
						</Text>
					) }

					{ wooUrl && (
						<div className="dashboard-marketplace-products__modal-footer">
							<ExternalLink href={ wooUrl }>
								{ __( 'View all details on WooCommerce.com' ) }
							</ExternalLink>
						</div>
					) }
				</VStack>

				<VStack
					spacing={ 4 }
					justify="flex-start"
					className="dashboard-marketplace-products__modal-rail"
				>
					<Card>
						<CardBody>
							<VStack spacing={ 1 }>
								<ProductPrice priceInfo={ priceInfo } currency={ product.currency } size="large" />
								{ termNote && (
									<Text variant="muted" size={ 12 }>
										{ termNote }
									</Text>
								) }
							</VStack>
						</CardBody>
					</Card>
					<Button
						className="dashboard-marketplace-products__modal-cta"
						variant={ inCart ? 'secondary' : 'primary' }
						__next40pxDefaultSize
						onClick={ onToggleCart }
					>
						{ cta }
					</Button>
				</VStack>
			</div>
		</Modal>
	);
}
