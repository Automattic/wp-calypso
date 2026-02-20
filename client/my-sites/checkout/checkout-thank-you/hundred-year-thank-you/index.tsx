import {
	PLAN_100_YEARS,
	getPlan,
	domainProductSlugs,
	is100Year,
} from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { Button, WordPressLogo } from '@automattic/components';
import { FLOWS_ZENDESK_FLOWNAME } from '@automattic/help-center/src/constants';
import { localizeUrl } from '@automattic/i18n-utils';
import { HUNDRED_YEAR_PLAN_FLOW, HUNDRED_YEAR_DOMAIN_FLOW } from '@automattic/onboarding';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { useUpdateZendeskUserFields } from '@automattic/zendesk-client';
import { Global, css } from '@emotion/react';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useMemo } from 'react';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import HundredYearLoaderView from 'calypso/components/hundred-year-loader-view';
import { useDispatch, useSelector } from 'calypso/state';
import { fetchReceipt } from 'calypso/state/receipts/actions';
import { getReceiptById } from 'calypso/state/receipts/selectors';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { getSiteId } from 'calypso/state/sites/selectors';
import { hideMasterbar } from 'calypso/state/ui/actions';

const VideoContainer = styled.div< { isMobile: boolean } >`
	overflow: hidden;
	position: relative;
	width: 100%;
	height: 55vh;
	video {
		transform: translatez( 0 );
		position: ${ ( { isMobile } ) => ( isMobile ? 'absolute' : 'initial' ) };
		top: -125%;
		bottom: -100%;
		left: -100%;
		right: -100%;
		margin: auto;
		min-width: ${ ( { isMobile } ) => ( isMobile ? '305%' : '100%' ) };
		min-height: ${ ( { isMobile } ) => ( isMobile ? '100%' : 'unset' ) };
	}
`;
const hundredYearProducts = [
	PLAN_100_YEARS,
	domainProductSlugs.DOTCOM_DOMAIN_REGISTRATION,
	domainProductSlugs.TRANSFER_IN,
] as const;

interface Props {
	siteId?: number;
	siteSlug?: string;
	receiptId: number;
	productSlug: ( typeof hundredYearProducts )[ number ];
}

const MasterBar = styled.div`
	height: 48px;
	width: 100%;
	padding: 24px 0 0 24px;
	box-sizing: border-box;
`;

const Header = styled.h1< { isMobile: boolean } >`
	font-size: ${ ( { isMobile } ) => ( isMobile ? '2rem' : '2.75rem' ) };
	line-height: ${ ( { isMobile } ) => ( isMobile ? '32px' : '52px' ) };
	text-align: ${ ( { isMobile } ) => ( isMobile ? 'left' : 'center' ) };
	margin: 16px 0;
`;

const Content = styled.div< { isMobile: boolean } >`
	margin: 0 auto;
	padding: 24px ${ ( { isMobile } ) => ( isMobile ? '16px' : '24px' ) };
	color: var( --studio-gray-5 );
	max-width: ${ ( { isMobile } ) => ( isMobile ? 'unset' : 'min( 95vw, 877px )' ) };
	text-align: center;
	.hundred-year-plan-thank-you__thank-you-text-container {
		margin: 24px ${ ( { isMobile } ) => ( isMobile ? '0' : '80px' ) };
	}
	.hundred-year-plan-thank-you__thank-you-link {
		color: var( --studio-gray-5 );
		text-decoration: underline;
		&:hover {
			text-decoration: none;
		}
	}
`;

const Highlight = styled.div< { isMobile: boolean } >`
	margin-bottom: 32px;
	text-align: ${ ( { isMobile } ) => ( isMobile ? 'left' : 'center' ) };
	font-size: 16px;
	p {
		margin: 0;
	}
`;

const ButtonBar = styled.div< { isMobile: boolean } >`
	margin-bottom: ${ ( { isMobile } ) => ( isMobile ? '8px' : '32px' ) };
	display: flex;
	justify-content: center;
	gap: 16px;
	flex-direction: ${ ( { isMobile } ) => ( isMobile ? 'column' : 'row' ) };
`;

const StyledButton = styled( Button )`
	border-radius: 4px;
	font-size: 14px;
	font-weight: 500;
	line-height: 20px;
	letter-spacing: 0.32px;
	text-align: center;
	background: none;
	box-shadow: none;
	outline-offset: 3px;
	color: var( --studio-gray-0 );
	padding: 10px 24px;
	&:focus {
		outline: 2px solid var( --studio-gray-0 );
	}
	&:hover {
		opacity: 85%;
		color: var( --studio-gray-0 );
	}
`;

const StyledLightButton = styled( StyledButton )`
	border: 1px solid var( --gray-gray-0, #f6f7f7 );
	background-color: var( --studio-black );
	background: linear-gradient( #c1c0d3, #e3e2f3, #c1c0d3 );
	color: var( --studio-black );
	border: none;

	&:hover {
		opacity: 85%;
		color: var( --studio-black );
	}

	&:focus {
		outline: 2px solid #d6d5e7;
	}
`;

const CustomizedWordPressLogo = styled( WordPressLogo )`
	margin: 0;
	fill: var( --studio-white );
`;

export default function HundredYearThankYou( {
	siteId: siteIdFromProps,
	siteSlug,
	receiptId,
	productSlug = PLAN_100_YEARS,
}: Props ) {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const siteIdFromSiteSlug = useSelector( ( state ) => getSiteId( state, siteSlug ?? null ) );
	const siteId = siteIdFromProps ?? siteIdFromSiteSlug;

	const receipt = useSelector( ( state ) => getReceiptById( state, receiptId ) );
	const isReceiptLoading = ! receipt.hasLoadedFromServer || receipt.isRequesting;

	// Infer whether this is a 100-year domain registration/transfer or the 100-year plan
	// If both are purchased, prioritize showing the plan variant
	const resolvedProductSlug = useMemo( () => {
		const purchases = receipt?.data?.purchases || [];
		// First check if there's a 100-year plan purchase - this takes precedence
		const hundredYearPlanPurchase = purchases.find( ( p ) => is100Year( p ) );
		if ( hundredYearPlanPurchase ) {
			return PLAN_100_YEARS;
		}
		// Otherwise, check for 100-year domain purchase
		const hundredYearDomainPurchase = purchases.find( ( p ) => p.isHundredYearDomain );
		if ( hundredYearDomainPurchase ) {
			return hundredYearDomainPurchase.isDomainRegistration
				? domainProductSlugs.DOTCOM_DOMAIN_REGISTRATION
				: domainProductSlugs.TRANSFER_IN;
		}
		return productSlug;
	}, [ receipt, productSlug ] );

	const siteDomains = useSelector( ( state ) =>
		siteId ? getDomainsBySiteId( state, siteId ) : []
	);

	const purchasedDomainName = useMemo( () => {
		const purchases = receipt?.data?.purchases || [];
		const hundredYearDomainPurchase = purchases.find( ( p ) => p.isHundredYearDomain );
		return hundredYearDomainPurchase?.meta || null;
	}, [ receipt ] );

	const { mutateAsync: submitUserFields } = useUpdateZendeskUserFields();

	useEffect( () => {
		dispatch( hideMasterbar() );
		if ( isReceiptLoading && receiptId ) {
			dispatch( fetchReceipt( receiptId ) );
		}
	}, [ dispatch, isReceiptLoading, receiptId ] );

	useEffect( () => {
		if ( resolvedProductSlug && submitUserFields && siteId ) {
			submitUserFields( {
				messaging_flow:
					FLOWS_ZENDESK_FLOWNAME[
						resolvedProductSlug === PLAN_100_YEARS
							? HUNDRED_YEAR_PLAN_FLOW
							: HUNDRED_YEAR_DOMAIN_FLOW
					],
				messaging_site_id: siteId,
				messaging_url: window.location.href,
			} );
		}
	}, [ siteId, submitUserFields, resolvedProductSlug ] );

	if (
		! isReceiptLoading &&
		( ! receipt.data?.purchases?.length || receipt.data?.purchases[ 0 ].blogId !== siteId ) &&
		// For transfers, the current siteId might be different - purchase performed with no site (siteId = null)
		// and blog created after the purchase (siteId != null).
		resolvedProductSlug !== domainProductSlugs.TRANSFER_IN
	) {
		page( '/' );
	}

	const primaryDomainFromState = siteDomains.find( ( domain ) => domain.isPrimary )?.domain;
	const displayDomain =
		resolvedProductSlug === PLAN_100_YEARS
			? primaryDomainFromState || siteSlug
			: purchasedDomainName || siteSlug;

	const isMobile = useMobileBreakpoint();
	const isPageLoading = isReceiptLoading;
	const hundredYearPlanCta = (
		<StyledLightButton onClick={ () => page( `/home/${ displayDomain }` ) }>
			{ translate( 'Manage your site' ) }
		</StyledLightButton>
	);
	const hundredYearDomainCta = (
		<StyledLightButton onClick={ () => page( `/domains/manage/${ displayDomain }` ) }>
			{ translate( 'Manage your domain' ) }
		</StyledLightButton>
	);
	const cta = resolvedProductSlug === PLAN_100_YEARS ? hundredYearPlanCta : hundredYearDomainCta;

	const domainSpecificDescription =
		resolvedProductSlug === domainProductSlugs.DOTCOM_DOMAIN_REGISTRATION
			? translate( 'Your 100-Year Domain %(domain)s has been registered.', {
					args: {
						domain: displayDomain,
					},
			  } )
			: translate( 'Your 100-Year Domain %(domain)s is being transferred.', {
					args: {
						domain: displayDomain,
					},
			  } );
	const hundredYearPlanDescription = translate( 'Your %(planTitle)s is now active.', {
		args: {
			planTitle: getPlan( PLAN_100_YEARS )?.getTitle() || '',
		},
	} );
	const helpAndSupportDescription = translate(
		'Our Premier Support team will be in touch by email shortly to schedule a welcome session and walk you through your exclusive benefits. We’re looking forward to supporting you every step of the way.'
	);
	const domainHelpAndSupportDescription = translate(
		'If you have any questions please take a look at {{faqLink}}our guide{{/faqLink}}, or feel free to reach out to our Premier Support team. We’re looking forward to working with you every step of the way.',
		{
			components: {
				faqLink: (
					<a
						href={ localizeUrl( 'https://wordpress.com/support/plan-features/100-year-plan/' ) }
						target="_blank"
						className="hundred-year-plan-thank-you__thank-you-link"
						rel="noopener noreferrer"
					/>
				),
			},
		}
	);

	const description =
		resolvedProductSlug === PLAN_100_YEARS ? (
			`${ hundredYearPlanDescription } ${ helpAndSupportDescription }`
		) : (
			<>
				{ domainSpecificDescription } { domainHelpAndSupportDescription }
			</>
		);

	return (
		<>
			{ siteId && ! siteDomains.length && <QuerySiteDomains siteId={ siteId } /> }
			<Global
				styles={ css`
					body.is-section-checkout,
					body.is-section-checkout .layout__content {
						background: linear-gradient( 233deg, #06101c 2.17%, #050c16 41.26%, #02080f 88.44% );
					}
				` }
			/>

			{ isPageLoading && (
				<HundredYearLoaderView
					isMobile={ isMobile }
					loadingText={ translate( 'Finalizing purchase…' ) }
				/>
			) }
			{ ! isPageLoading && (
				<>
					<MasterBar>
						<CustomizedWordPressLogo size={ 24 } />
					</MasterBar>
					<Content isMobile={ isMobile }>
						<div className="hundred-year-plan-thank-you__thank-you-text-container">
							<Header className="wp-brand-font" isMobile={ isMobile }>
								{ translate( 'Your century-long legacy begins now' ) }
							</Header>
							<Highlight isMobile={ isMobile }>{ description }</Highlight>
							<ButtonBar isMobile={ isMobile }>{ cta }</ButtonBar>
						</div>
						<VideoContainer isMobile={ isMobile }>
							<video
								src="https://wpcom.files.wordpress.com/2025/03/century-100-banner-new.mp4"
								preload="auto"
								width="100%"
								height="auto"
								muted
								playsInline
								autoPlay
								loop
							/>
						</VideoContainer>
					</Content>
				</>
			) }
		</>
	);
}
