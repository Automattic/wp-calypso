import {
	Button,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { check } from '@wordpress/icons';
import { Badge } from '@wordpress/ui';
import { ButtonStack } from '../../../components/button-stack';
import { Card, CardBody } from '../../../components/card';
import jetpackLogo from '../exclusive-offers/images/jetpack-descriptor.svg';
import wooLogo from '../exclusive-offers/images/woo-descriptor.svg';
import woopaymentsLogo from '../exclusive-offers/images/woopayments.svg';
import { formatUSD } from '../hosting/mock-data';
import { KIND_LABEL, priceFor, shortTitle, WOOPAYMENTS_CARD } from './mock-data';
import type { CatalogProduct } from './mock-data';

// Brand mark for the card's top row — the Exclusive Offers card grammar
// (logo beside the badge). Round badge crop of the descriptor lockups.
function markFor( product: CatalogProduct ): string {
	if ( product.slug === WOOPAYMENTS_CARD.slug ) {
		return woopaymentsLogo;
	}
	return product.family.startsWith( 'jetpack' ) ? jetpackLogo : wooLogo;
}

export type ProductCardProps = {
	product: CatalogProduct;
	term: 'monthly' | 'yearly';
	isReferralMode: boolean;
	inCart: boolean;
	onToggleCart: () => void;
	onDetails: () => void;
};

// Card = Main's product card in the Exclusive Offers card grammar: badges,
// title, one-line description, price with its interval, then the CTA and the
// details link. Main's CTA is primary; here it is secondary so a wall of 74
// cards doesn't become a wall of blue — the primary is the cart.
export default function ProductCard( {
	product,
	term,
	isReferralMode,
	inCart,
	onToggleCart,
	onDetails,
}: ProductCardProps ) {
	const isWooPayments = product.slug === WOOPAYMENTS_CARD.slug;
	const { price, interval, note } = priceFor( product, term );
	// One badge: the category when there is one, else the kind. "Extension" on
	// every Woo card said nothing; "Payments" does.
	const badge = product.categories[ 0 ] ?? KIND_LABEL[ product.kind ];
	let cta: string = inCart ? __( 'Added to cart' ) : __( 'Add to cart' );
	if ( isReferralMode ) {
		cta = inCart ? __( 'Added to referral' ) : __( 'Add to referral' );
	}

	return (
		<Card className="marketplace-products__card">
			<CardBody style={ { display: 'flex', flexDirection: 'column', height: '100%' } }>
				<VStack spacing={ 3 } style={ { flex: 1, justifyContent: 'flex-start' } }>
					<HStack spacing={ 2 } justify="space-between" expanded>
						<img
							src={ markFor( product ) }
							alt=""
							className={
								isWooPayments
									? 'marketplace-products__card-logo'
									: 'marketplace-products__card-mark'
							}
						/>
						<Badge intent="draft">{ badge }</Badge>
					</HStack>
					<VStack spacing={ 1 }>
						<Text size={ 13 } weight={ 500 }>
							{ isWooPayments ? WOOPAYMENTS_CARD.title : shortTitle( product ) }
						</Text>
						<Text variant="muted" size={ 12 }>
							{ isWooPayments ? WOOPAYMENTS_CARD.description : product.description }
						</Text>
					</VStack>
				</VStack>
				{ /* Price and actions travel together at the card's foot, so short
				   descriptions leave the gap above the price rather than between it
				   and the buttons. */ }
				<VStack spacing={ 3 } style={ { marginTop: '16px' } }>
					{ ! isWooPayments && (
						<HStack spacing={ 1 } justify="flex-start" alignment="baseline" expanded={ false }>
							<Text weight={ 600 }>
								{ price === 0 ? __( 'Free' ) : formatUSD( price ) }
								{ price > 0 && (
									<Text as="span" variant="muted" size={ 12 }>
										{ interval }
									</Text>
								) }
							</Text>
							{ price > 0 && (
								<Text variant="muted" size={ 12 }>
									{ '· ' + note }
								</Text>
							) }
						</HStack>
					) }
					<ButtonStack
						style={ { alignSelf: 'flex-start', justifyContent: 'flex-start', gap: '16px' } }
					>
						<Button
							variant="secondary"
							icon={ inCart ? check : undefined }
							onClick={ onToggleCart }
							aria-pressed={ inCart }
						>
							{ cta }
						</Button>
						<Button variant="link" onClick={ onDetails } style={ { whiteSpace: 'nowrap' } }>
							{ __( 'View details' ) }
						</Button>
					</ButtonStack>
				</VStack>
			</CardBody>
		</Card>
	);
}
