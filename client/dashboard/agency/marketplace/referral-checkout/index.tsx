import { activeAgencyQuery, agencyProductsQuery } from '@automattic/api-queries';
import { AutomatticLogo } from '@automattic/components/src/logos/automattic-logo';
import { useQuery } from '@tanstack/react-query';
import {
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { check, chevronLeft, Icon } from '@wordpress/icons';
import { useAuth } from '../../../app/auth';
import { marketplaceReferralCheckoutRoute } from '../../../app/router/agency';
import { Notice } from '../../../components/notice';
import RouterLinkButton from '../../../components/router-link-button';
import { MARKETPLACE_PRODUCTS_ROUTE } from '../paths';
import { useCartLines } from '../products/use-cart-lines';
import { useShoppingCart } from '../products/use-shopping-cart';
import { useTermPricing } from '../use-term-pricing';
import RequestClientPaymentForm from './request-form';
import ReferralSummary from './summary';
import { useDevSiteReferral } from './use-dev-site-referral';
import { useRequestClientPayment } from './use-request-client-payment';
import './style.scss';

/**
 * Asks a client to pay for the referral cart, or for the plan of one of the
 * agency's development sites. Takes the whole screen like the WordPress.com
 * checkout a paid cart goes to, with a Back link to the page it was opened from.
 */
export default function ReferralCheckout() {
	const { user } = useAuth();
	const { from, referral_blog_id: referralBlogId } = marketplaceReferralCheckoutRoute.useSearch();
	const { data: agency } = useQuery( activeAgencyQuery() );
	const agencyId = agency?.id ?? 0;
	const { data: products } = useQuery( agencyProductsQuery( agencyId ) );
	const { termPricing: savedTerm } = useTermPricing();
	const { items: cartItems } = useShoppingCart( 'referral' );
	const devSite = useDevSiteReferral( agencyId, referralBlogId, products ?? [] );
	const termPricing = devSite.term ?? savedTerm;

	const cart = useCartLines( {
		items: referralBlogId ? devSite.items : cartItems,
		products: products ?? [],
		term: termPricing,
		isReferralMode: true,
	} );
	const request = useRequestClientPayment( {
		agencyId,
		lines: cart.lines,
		term: termPricing,
		license: devSite.license,
	} );

	const backTo = from ?? MARKETPLACE_PRODUCTS_ROUTE;
	const isFreeOnly = cart.lines.length > 0 && cart.lines.every( ( line ) => line.priceInfo.isFree );

	const renderBody = () => {
		if ( referralBlogId && devSite.isLoading ) {
			return null;
		}
		if ( referralBlogId && devSite.isMissing ) {
			return (
				<div className="referral-checkout__empty">
					<Notice
						variant="error"
						title={ __( 'Failed to load the site’s plan.' ) }
						actions={
							<RouterLinkButton variant="primary" to={ backTo }>
								{ __( 'Back' ) }
							</RouterLinkButton>
						}
					>
						{ __(
							'We couldn’t find a development plan for this site to refer. Go back and try again.'
						) }
					</Notice>
				</div>
			);
		}
		if ( cart.lines.length === 0 ) {
			return (
				<div className="referral-checkout__empty">
					<Notice
						variant="info"
						title={ __( 'Your cart is empty.' ) }
						actions={
							<RouterLinkButton variant="primary" to={ backTo }>
								{ __( 'Back to the marketplace' ) }
							</RouterLinkButton>
						}
					>
						{ __( 'Add the products you want to refer, then come back to request the payment.' ) }
					</Notice>
				</div>
			);
		}
		return (
			<div className="referral-checkout__body">
				<VStack className="referral-checkout__main" spacing={ 6 }>
					<HStack spacing={ 3 } justify="flex-start" alignment="center" expanded={ false }>
						<span className="referral-checkout__title-check">
							<Icon icon={ check } size={ 24 } />
						</span>
						<Heading level={ 1 } size={ 28 } weight={ 500 }>
							{ __( 'Request client payment' ) }
						</Heading>
					</HStack>
					{ isFreeOnly && (
						<Notice variant="info">
							{ __(
								'Because your referral includes only free products, you can assign them immediately after purchase — no client payment or approval required.'
							) }
						</Notice>
					) }
					{ ! isFreeOnly && (
						<RequestClientPaymentForm
							email={ request.email }
							emailError={ request.emailError }
							message={ request.message }
							onEmailChange={ request.onEmailChange }
							onMessageChange={ request.onMessageChange }
						/>
					) }
				</VStack>
				<aside className="referral-checkout__aside">
					<ReferralSummary
						lines={ cart.lines }
						siteUrl={ devSite.license?.siteUrl }
						currency={ cart.currency }
						term={ termPricing }
						total={ cart.total }
						commission={ cart.commission }
						isTotalReady={ cart.isTotalReady }
						isFreeOnly={ isFreeOnly }
						isUserUnverified={ ! user.email_verified }
						canIssueLicenses={ agency?.can_issue_licenses ?? true }
						canSend={ request.canSend }
						canCopy={ request.canCopy }
						isBusy={ request.isBusy }
						onSend={ request.send }
						onCopy={ request.copy }
						onPurchase={ request.purchase }
					/>
				</aside>
			</div>
		);
	};

	return (
		<div className="referral-checkout">
			<HStack className="referral-checkout__top-bar" justify="flex-start" spacing={ 6 }>
				<AutomatticLogo width={ 183 } height={ 40 } />
				<RouterLinkButton to={ backTo } variant="link" icon={ chevronLeft }>
					{ __( 'Back' ) }
				</RouterLinkButton>
			</HStack>
			{ renderBody() }
		</div>
	);
}
