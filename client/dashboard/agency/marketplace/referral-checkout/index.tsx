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
import { useState } from 'react';
import { useAnalytics } from '../../../app/analytics';
import { useAuth } from '../../../app/auth';
import { marketplaceReferralCheckoutRoute } from '../../../app/router/agency';
import { Notice } from '../../../components/notice';
import RouterLinkButton from '../../../components/router-link-button';
import { MARKETPLACE_PRODUCTS_ROUTE } from '../paths';
import { useCartLines } from '../products/use-cart-lines';
import { useShoppingCart } from '../products/use-shopping-cart';
import { useTermPricing } from '../use-term-pricing';
import ReferralEmailPreviewModal from './email-preview-modal';
import { getReferralLogoPreviewUrl } from './lib/logo';
import RequestClientPaymentForm from './request-form';
import ReferralSummary from './summary';
import { useRequestClientPayment } from './use-request-client-payment';
import './style.scss';

/**
 * Asks a client to pay for the referral cart. Takes the whole screen like the
 * WordPress.com checkout a paid cart goes to, with a Back link to the
 * marketplace page the cart came from.
 */
export default function ReferralCheckout() {
	const { user } = useAuth();
	const { recordTracksEvent } = useAnalytics();
	const { from } = marketplaceReferralCheckoutRoute.useSearch();
	const { data: agency } = useQuery( activeAgencyQuery() );
	const agencyId = agency?.id ?? 0;
	const { data: products } = useQuery( agencyProductsQuery( agencyId ) );
	const { termPricing } = useTermPricing();
	const { items } = useShoppingCart( 'referral' );

	const cart = useCartLines( {
		items,
		products: products ?? [],
		term: termPricing,
		isReferralMode: true,
	} );
	const profileLogoUrl = agency?.profile?.company_details?.logo_url || null;
	const lastReferralLogoUrl = agency?.referrals_logo || null;
	const request = useRequestClientPayment( {
		agencyId,
		lines: cart.lines,
		term: termPricing,
		profileLogoUrl,
		lastReferralLogoUrl,
	} );

	const [ preview, setPreview ] = useState< { logoUrl?: string } | null >( null );
	const openPreview = async () => {
		recordTracksEvent( 'calypso_a4a_client_referral_email_preview_click' );
		setPreview( { logoUrl: await getReferralLogoPreviewUrl( request.logo ) } );
	};

	const backTo = from ?? MARKETPLACE_PRODUCTS_ROUTE;
	const isFreeOnly = cart.lines.length > 0 && cart.lines.every( ( line ) => line.priceInfo.isFree );

	return (
		<div className="referral-checkout">
			<HStack className="referral-checkout__top-bar" justify="flex-start" spacing={ 6 }>
				<AutomatticLogo width={ 183 } height={ 40 } />
				<RouterLinkButton to={ backTo } variant="link" icon={ chevronLeft }>
					{ __( 'Back' ) }
				</RouterLinkButton>
			</HStack>
			{ cart.lines.length === 0 ? (
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
			) : (
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
								logo={ request.logo }
								profileLogoUrl={ profileLogoUrl }
								lastReferralLogoUrl={ lastReferralLogoUrl }
								onEmailChange={ request.onEmailChange }
								onMessageChange={ request.onMessageChange }
								onLogoChange={ request.onLogoChange }
							/>
						) }
					</VStack>
					<aside className="referral-checkout__aside">
						<ReferralSummary
							lines={ cart.lines }
							currency={ cart.currency }
							term={ termPricing }
							total={ cart.total }
							commission={ cart.commission }
							isTotalReady={ cart.isTotalReady }
							isFreeOnly={ isFreeOnly }
							isUserUnverified={ ! user.email_verified }
							canSend={ request.canSend }
							canCopy={ request.canCopy }
							isBusy={ request.isBusy }
							onSend={ request.send }
							onCopy={ request.copy }
							onPurchase={ request.purchase }
							onPreview={ openPreview }
						/>
					</aside>
				</div>
			) }
			{ preview && (
				<ReferralEmailPreviewModal
					agencyId={ agencyId }
					productIds={ request.productIds }
					greetingLine={ request.message.trim() }
					logoUrl={ preview.logoUrl }
					term={ termPricing }
					onClose={ () => setPreview( null ) }
				/>
			) }
		</div>
	);
}
