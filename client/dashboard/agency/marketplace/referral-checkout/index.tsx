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
import { EmptyCartNotice, MissingSitePlanNotice } from './notices';
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
	const { recordTracksEvent } = useAnalytics();
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
	const profileLogoUrl = agency?.profile?.company_details?.logo_url || null;
	const lastReferralLogoUrl = agency?.referrals_logo || null;
	const request = useRequestClientPayment( {
		agencyId,
		lines: cart.lines,
		term: termPricing,
		profileLogoUrl,
		lastReferralLogoUrl,
		license: devSite.license,
	} );

	const [ preview, setPreview ] = useState< { logoUrl?: string } | null >( null );
	const openPreview = async () => {
		recordTracksEvent( 'calypso_a4a_client_referral_email_preview_click' );
		setPreview( { logoUrl: await getReferralLogoPreviewUrl( request.logo ) } );
	};

	const backTo = from ?? MARKETPLACE_PRODUCTS_ROUTE;

	const isSiteLoading = !! referralBlogId && devSite.isLoading;

	let notice = null;
	if ( referralBlogId && devSite.isMissing ) {
		notice = <MissingSitePlanNotice backTo={ backTo } />;
	} else if ( cart.lines.length === 0 && ! isSiteLoading ) {
		notice = <EmptyCartNotice backTo={ backTo } />;
	}

	return (
		<div className="referral-checkout">
			<HStack className="referral-checkout__top-bar" justify="flex-start" spacing={ 6 }>
				<AutomatticLogo width={ 183 } height={ 40 } />
				<RouterLinkButton to={ backTo } variant="link" icon={ chevronLeft }>
					{ __( 'Back' ) }
				</RouterLinkButton>
			</HStack>
			{ notice ?? (
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
					</VStack>
					<aside className="referral-checkout__aside">
						<ReferralSummary
							lines={ cart.lines }
							siteUrl={ devSite.license?.siteUrl }
							currency={ cart.currency }
							term={ termPricing }
							total={ cart.total }
							commission={ cart.commission }
							isLoading={ isSiteLoading }
							isTotalReady={ cart.isTotalReady && ! isSiteLoading }
							isUserUnverified={ ! user.email_verified }
							canSend={ request.canSend && ! isSiteLoading }
							canCopy={ request.canCopy && ! isSiteLoading }
							isBusy={ request.isBusy }
							onSend={ request.send }
							onCopy={ request.copy }
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
