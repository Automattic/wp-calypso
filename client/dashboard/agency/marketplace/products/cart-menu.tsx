import { formatCurrency } from '@automattic/number-formatters';
import {
	Button,
	Dropdown,
	Tooltip,
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import { cart } from '@wordpress/icons';
import { useAnalytics } from '../../../app/analytics';
import { a4aLink } from '../../../utils/link';
import { getProductCommissionPercentage } from '../../earn/referrals/lib/commissions';
import { isPressableHostingProduct } from '../hosting/lib/pressable-plans';
import { getEffectivePressableOwnership } from '../hosting/lib/pressable-products';
import { CLASSIC_MARKETPLACE_CHECKOUT_PATH, MARKETPLACE_PRODUCTS_ROUTE } from '../paths';
import { useAgencyPressablePlan } from '../use-agency-pressable-plan';
import { getProductPriceInfo, getTermSuffix } from './lib/product-pricing';
import { getProductShortTitle } from './lib/product-title';
import type { TermPricing } from '../use-term-pricing';
import type { ShoppingCartItem } from './use-shopping-cart';
import type { AgencyProduct } from '@automattic/api-core';

interface Props {
	items: ShoppingCartItem[];
	products: AgencyProduct[];
	term: TermPricing;
	isReferralMode: boolean;
	isAgencyApproved: boolean;
	/** Controls the dropdown, for pages that open the cart after adding to it. */
	open?: boolean;
	onToggle?: ( willOpen: boolean ) => void;
	onRemove: ( slug: string ) => void;
	onCheckout: () => void;
}

const getCartProductName = ( product: AgencyProduct ) =>
	product.slug === 'wpcom-hosting-business'
		? __( 'WordPress.com Site' )
		: getProductShortTitle( product );

export default function CartMenu( {
	items,
	products,
	term,
	isReferralMode,
	isAgencyApproved,
	open,
	onToggle,
	onRemove,
	onCheckout,
}: Props ) {
	const { recordTracksEvent } = useAnalytics();
	// Pressable's introductory price only applies to agencies without a plan,
	// so the cart checks for one itself and matches the Hosting page everywhere.
	const { plan: pressablePlan, ownership: pressableOwnership } = useAgencyPressablePlan();
	const applyPressableIntroductoryPrice =
		isReferralMode ||
		getEffectivePressableOwnership( pressableOwnership, pressablePlan, isReferralMode ) !==
			'agency';

	const lines = items
		.map( ( item ) => {
			const product = products.find( ( candidate ) => candidate.slug === item.slug );
			if ( ! product ) {
				return null;
			}
			const applyIntroductoryPrice =
				! isPressableHostingProduct( product.family_slug ) || applyPressableIntroductoryPrice;
			return {
				item,
				product,
				priceInfo: getProductPriceInfo( product, term, { applyIntroductoryPrice } ),
			};
		} )
		.filter( ( line ): line is NonNullable< typeof line > => line !== null );

	const currency = lines[ 0 ]?.product.currency ?? 'USD';
	const total = lines.reduce(
		( sum, { item, priceInfo } ) => sum + priceInfo.price * item.quantity,
		0
	);
	const commission = lines.reduce(
		( sum, { item, product, priceInfo } ) =>
			sum +
			priceInfo.price *
				item.quantity *
				getProductCommissionPercentage( product.slug, product.family_slug ),
		0
	);

	// The classic checkout reads the products from the URL, but only takes the
	// purchase mode from its own session, so referral carts go through the
	// classic products page in referral mode instead.
	const checkoutUrl = isReferralMode
		? a4aLink(
				`${ MARKETPLACE_PRODUCTS_ROUTE }?products=${ items
					.map( ( item ) => `${ item.slug }:${ item.quantity }` )
					.join( ',' ) }&purchase_type=referral`
		  )
		: a4aLink(
				`${ CLASSIC_MARKETPLACE_CHECKOUT_PATH }?product_slug=${ items
					.map( ( item ) => item.slug )
					.join( ',' ) }`
		  );

	const checkoutButton = (
		<Button
			variant="primary"
			__next40pxDefaultSize
			href={ checkoutUrl }
			disabled={ lines.length === 0 || ! isAgencyApproved }
			onClick={ () => {
				recordTracksEvent( 'calypso_a4a_marketplace_checkout_click', {
					purchase_mode: isReferralMode ? 'referral' : 'regular',
					term_pricing: term,
				} );
				onCheckout();
			} }
		>
			{ __( 'Checkout' ) }
		</Button>
	);

	return (
		<Dropdown
			open={ open }
			onToggle={ onToggle }
			popoverProps={ { placement: 'bottom-end' } }
			renderToggle={ ( { isOpen, onToggle } ) => (
				<Button
					icon={ cart }
					label={
						items.length > 0
							? sprintf(
									/* translators: %d is the number of items in the cart. */
									_n( 'Shopping cart, %d item', 'Shopping cart, %d items', items.length ),
									items.length
							  )
							: __( 'Shopping cart' )
					}
					aria-expanded={ isOpen }
					text={ items.length > 0 ? String( items.length ) : undefined }
					onClick={ () => {
						recordTracksEvent( 'calypso_a4a_marketplace_toggle_cart', {
							purchase_mode: isReferralMode ? 'referral' : 'regular',
							term_pricing: term,
						} );
						onToggle();
					} }
				/>
			) }
			renderContent={ () => (
				<VStack spacing={ 3 } className="dashboard-marketplace-products__cart">
					<Heading level={ 3 } size={ 13 }>
						{ __( 'Your cart' ) }
					</Heading>
					{ lines.length === 0 && <Text variant="muted">{ __( 'Your cart is empty.' ) }</Text> }
					{ lines.map( ( { item, product, priceInfo } ) => (
						<HStack key={ item.slug } justify="space-between" spacing={ 4 } alignment="flex-start">
							<VStack spacing={ 0 }>
								<Text>
									{ item.quantity > 1
										? sprintf(
												/* translators: %1$s is the product name, %2$d the quantity. */
												__( '%1$s x %2$d' ),
												getCartProductName( product ),
												item.quantity
										  )
										: getCartProductName( product ) }
								</Text>
								{ /* The spans keep Google Translate from crashing on sibling text nodes. */ }
								<Text variant="muted" size={ 12 }>
									<span>
										{ priceInfo.isFree
											? __( 'Free' )
											: formatCurrency( priceInfo.price * item.quantity, currency ) +
											  getTermSuffix( term ) }
									</span>
									{ ! priceInfo.isFree && priceInfo.billingTerm !== term && (
										<span>
											{ ' ' +
												( priceInfo.billingTerm === 'yearly'
													? __( '(billed yearly)' )
													: __( '(billed monthly)' ) ) }
										</span>
									) }
								</Text>
							</VStack>
							<Button variant="link" isDestructive onClick={ () => onRemove( item.slug ) }>
								{ __( 'Remove' ) }
							</Button>
						</HStack>
					) ) }
					{ lines.length > 0 && (
						<>
							<HStack justify="space-between">
								<Text weight={ 600 }>
									{ isReferralMode ? __( 'Total your client will pay:' ) : __( 'Total:' ) }
								</Text>
								<Text weight={ 600 }>
									{ formatCurrency( total, currency ) + getTermSuffix( term ) }
								</Text>
							</HStack>
							{ isReferralMode && commission > 0 && (
								<HStack justify="space-between">
									<Text variant="muted">{ __( 'Your estimated commission:' ) }</Text>
									<Text variant="muted">
										{ formatCurrency( commission, currency ) + getTermSuffix( term ) }
									</Text>
								</HStack>
							) }
						</>
					) }
					{ isAgencyApproved ? (
						checkoutButton
					) : (
						<Tooltip
							text={ __(
								'Your agency is not yet approved. Please wait for approval before making a purchase.'
							) }
						>
							<span>{ checkoutButton }</span>
						</Tooltip>
					) }
				</VStack>
			) }
		/>
	);
}
