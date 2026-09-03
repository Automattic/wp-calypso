import {
	Button,
	ExternalLink,
	Icon,
	Modal,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { check, closeSmall, store } from '@wordpress/icons';
import { Card, CardBody } from '../../../components/card';
import jetpackLogo from '../exclusive-offers/images/jetpack-descriptor.svg';
import wooLogo from '../exclusive-offers/images/woo-descriptor.svg';
import { formatUSD } from '../hosting/mock-data';
import { priceFor, WOOPAYMENTS_CARD } from './mock-data';
import type { CatalogProduct } from './mock-data';

/**
 * Main's product lightbox, rebuilt with MSD parts: the product's identity,
 * description, "Great for" tags and benefits on the left, and the price with
 * its CTA in a rail on the right — so the price never scrolls away from the
 * button. Content (benefits, tags, vendors, Woo links) is Main's own, so
 * nothing here is invented.
 */
export default function ProductDetails( {
	product,
	term,
	isReferralMode,
	inCart,
	onToggleCart,
	onClose,
}: {
	product: CatalogProduct;
	term: 'monthly' | 'yearly';
	isReferralMode: boolean;
	inCart: boolean;
	onToggleCart: () => void;
	onClose: () => void;
} ) {
	const { price, interval, note } = priceFor( product, term );
	const isWooPayments = product.slug === WOOPAYMENTS_CARD.slug;
	const mark = product.family.startsWith( 'jetpack' ) ? jetpackLogo : wooLogo;
	let cta = inCart ? __( 'Remove from cart' ) : __( 'Add to cart' );
	if ( isReferralMode ) {
		cta = inCart ? __( 'Remove from referral' ) : __( 'Add to referral' );
	}

	return (
		<Modal
			title={ product.name }
			onRequestClose={ onClose }
			size="large"
			className="marketplace-products__modal"
			__experimentalHideHeader
		>
			<div className="marketplace-products__modal-layout">
				<Button
					icon={ closeSmall }
					label={ __( 'Close' ) }
					onClick={ onClose }
					className="marketplace-products__modal-close"
				/>
				<VStack spacing={ 6 } justify="flex-start" className="marketplace-products__modal-main">
					<VStack spacing={ 4 }>
						<HStack spacing={ 3 } justify="flex-start" alignment="flex-start" expanded={ false }>
							<img src={ mark } alt="" className="marketplace-products__modal-mark" />
							<VStack spacing={ 1 }>
								<Text size={ 20 } weight={ 600 }>
									{ product.name }
								</Text>
								<Text variant="muted">
									{ __( 'By' ) }{ ' ' }
									<ExternalLink href={ product.vendorUrl }>{ product.vendorName }</ExternalLink>
								</Text>
							</VStack>
						</HStack>
						<Text>{ product.description }</Text>
					</VStack>

					{ product.greatFor.length > 0 && (
						<Card>
							<CardBody>
								<HStack spacing={ 3 } justify="flex-start" alignment="center" wrap>
									<Text weight={ 500 }>{ __( 'Great for:' ) }</Text>
									{ product.greatFor.map( ( tag ) => (
										<HStack key={ tag } spacing={ 1 } justify="flex-start" expanded={ false }>
											<Icon icon={ store } size={ 18 } />
											<Text variant="muted">{ tag }</Text>
										</HStack>
									) ) }
								</HStack>
							</CardBody>
						</Card>
					) }

					{ product.benefits.length > 0 && (
						<VStack spacing={ 3 }>
							<Text weight={ 500 }>{ __( 'Benefits' ) }</Text>
							<VStack spacing={ 2 } as="ul" className="marketplace-products__benefits">
								{ product.benefits.map( ( benefit ) => (
									<HStack
										key={ benefit }
										as="li"
										spacing={ 2 }
										justify="flex-start"
										alignment="flex-start"
									>
										<Icon
											icon={ check }
											size={ 20 }
											className="marketplace-products__benefit-check"
										/>
										<Text variant="muted">{ benefit }</Text>
									</HStack>
								) ) }
							</VStack>
						</VStack>
					) }

					{ isWooPayments && (
						<VStack spacing={ 2 }>
							<Text weight={ 500 }>{ __( 'This extension requires WooCommerce' ) }</Text>
							<Text variant="muted">
								{ __(
									'Only sites that have the Automattic for Agencies plugin installed and connected are eligible for revenue share with WooPayments.'
								) }
							</Text>
						</VStack>
					) }

					{ product.wooUrl && (
						<div className="marketplace-products__modal-footer">
							<Button variant="link" href={ product.wooUrl } target="_blank" rel="noreferrer">
								{ __( 'View all details on WooCommerce.com ↗' ) }
							</Button>
						</div>
					) }
				</VStack>

				<VStack spacing={ 4 } justify="flex-start" className="marketplace-products__modal-rail">
					<Card>
						<CardBody>
							<VStack spacing={ 0 }>
								<Text size={ 24 } weight={ 600 }>
									{ price === 0 ? __( 'Free' ) : formatUSD( price ) }
									{ price > 0 && (
										<Text as="span" variant="muted" size={ 13 }>
											{ interval }
										</Text>
									) }
								</Text>
								{ price > 0 && (
									<Text variant="muted" size={ 12 }>
										{ note }
									</Text>
								) }
							</VStack>
						</CardBody>
					</Card>
					<Button
						variant={ inCart ? 'secondary' : 'primary' }
						__next40pxDefaultSize
						icon={ inCart ? check : undefined }
						onClick={ onToggleCart }
					>
						{ cta }
					</Button>
				</VStack>
			</div>
		</Modal>
	);
}
