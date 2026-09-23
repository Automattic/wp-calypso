import {
	Button,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { check } from '@wordpress/icons';
import { Badge } from '@wordpress/ui';
import woopaymentsLogo from '../exclusive-offers/images/woopayments.svg';
import { ButtonStack } from '../../../components/button-stack';
import { Card, CardBody } from '../../../components/card';
import { formatUSD } from '../hosting/mock-data';
import {
	KIND_LABEL,
	priceFor,
	shortTitle,
	WOOPAYMENTS_CARD,
	WOOPAYMENTS_PRICE_NOTE,
} from './mock-data';
import type { CatalogProduct } from './mock-data';

export type ProductCardProps = {
	product: CatalogProduct;
	term: 'monthly' | 'yearly';
	isReferralMode: boolean;
	inCart: boolean;
	onToggleCart: () => void;
	onDetails: () => void;
	/** A4AD-190: render WooPayments as an ordinary card rather than a banner. */
	asOrdinaryCard?: boolean;
	/** A4AD-190: fill that card with WooCommerce purple, the way Main does today. */
	branded?: boolean;
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
	asOrdinaryCard = false,
	branded = false,
}: ProductCardProps ) {
	// A4AD-190: in the 'card' option WooPayments is an ordinary card, so the
	// custom title and the hidden price only apply to the banner options.
	const isWooPayments = product.slug === WOOPAYMENTS_CARD.slug && ! asOrdinaryCard;
	const earnsRevenueShare = product.slug === WOOPAYMENTS_CARD.slug && asOrdinaryCard;
	const { price, interval, note } = priceFor( product, term );
	// A4AD-194: Main's hierarchy carries a row of tags under the title rather
	// than one badge in a header row. With the family mark gone, the header row
	// left a badge floating against nothing, so the tags move under the title
	// and the card leads with its name.
	const tags = product.categories.length
		? product.categories
		: [ KIND_LABEL[ product.kind ] ].filter( Boolean );
	let cta: string = inCart ? __( 'Added to cart' ) : __( 'Add to cart' );
	if ( isReferralMode ) {
		cta = inCart ? __( 'Added to referral' ) : __( 'Add to referral' );
	}

	return (
		<Card
			className={
				earnsRevenueShare && branded
					? 'marketplace-products__card marketplace-products__card--brand'
					: 'marketplace-products__card'
			}
		>
			<CardBody style={ { display: 'flex', flexDirection: 'column', height: '100%' } }>
				<VStack spacing={ 3 } style={ { flex: 1, justifyContent: 'flex-start' } }>
					<VStack spacing={ 2 }>
						{ /* A4AD-190: the lockup sits above the title, the way Main leads
						   its card, with the plain product title underneath it. */ }
						{ earnsRevenueShare && (
							<img
								src={ woopaymentsLogo }
								alt=""
								className={
									branded
										? 'marketplace-products__card-brandmark is-inverted'
										: 'marketplace-products__card-brandmark'
								}
							/>
						) }
						<Text size={ 13 } weight={ 500 }>
							{ isWooPayments || earnsRevenueShare
								? WOOPAYMENTS_CARD.title
								: shortTitle( product ) }
						</Text>
						{ /* Tags wrap, because three of them do not fit one column.
						   WooPayments carries none: the lockup and the offer line are
						   the whole card, the way Main has it. */ }
						{ ! earnsRevenueShare && (
							<HStack
								spacing={ 1 }
								justify="flex-start"
								expanded={ false }
								className="marketplace-products__card-tags"
							>
								{ tags.map( ( tag ) => (
									<Badge key={ tag } intent="draft">
										{ tag }
									</Badge>
								) ) }
							</HStack>
						) }
						{ /* Price sits above the description, as it does in Main, with the
						   cadence on its own line under the number. */ }
						{ ! isWooPayments && ! earnsRevenueShare && (
							<VStack spacing={ 0 }>
								<Text weight={ 600 }>{ price === 0 ? __( 'Free' ) : formatUSD( price ) }</Text>
								{ ( price > 0 || earnsRevenueShare ) && (
									<Text variant="muted" size={ 12 }>
										{ earnsRevenueShare
											? WOOPAYMENTS_PRICE_NOTE
											: interval.replace( /^\//, 'per ' ) + ', ' + note }
									</Text>
								) }
							</VStack>
						) }
						<Text variant="muted" size={ 12 }>
							{ isWooPayments ? WOOPAYMENTS_CARD.description : product.description }
						</Text>
					</VStack>
				</VStack>
				{ /* Price and actions travel together at the card's foot, so short
				   descriptions leave the gap above the price rather than between it
				   and the buttons. */ }
				<VStack spacing={ 3 } style={ { marginTop: '16px' } }>
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
