import {
	formatCurrency,
	formatNumberCompact,
	getCurrencyObject,
} from '@automattic/number-formatters';
import { Button, ExternalLink, __experimentalHeading as Heading } from '@wordpress/components';
import { useCopyToClipboard } from '@wordpress/compose';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { Icon, check, copy, external } from '@wordpress/icons';
import { useEffect, useState, type ReactNode } from 'react';
import cartImage from 'calypso/assets/images/a8c-for-agencies/woopayments/cart.webp';
import ccImage from 'calypso/assets/images/a8c-for-agencies/woopayments/cc-image.webp';
import demoImage from 'calypso/assets/images/a8c-for-agencies/woopayments/demo.webp';
import earnMoreImage from 'calypso/assets/images/a8c-for-agencies/woopayments/earn-more.webp';
import iconStorePlus from 'calypso/assets/images/a8c-for-agencies/woopayments/icon-store-plus.webp';
import iconStore from 'calypso/assets/images/a8c-for-agencies/woopayments/icon-store.webp';
import wooPaymentsLogo from 'calypso/assets/images/a8c-for-agencies/woopayments/logo.svg';
import { useAnalytics } from '../../../../app/analytics';
import { ButtonStack } from '../../../../components/button-stack';
import InlineSupportLink from '../../../../components/inline-support-link';
import { Text } from '../../../../components/text';
import { useContactSupport } from '../../../support/use-contact-support';

import './style.scss';

const PROGRAM_TERMS_LINK =
	'https://agencieshelp.automattic.com/knowledge-base/earn-revenue-share-when-clients-use-woopayments/';
const PROGRAM_INCENTIVES_LINK = 'https://automattic.com/for-agencies/program-incentives';
const WOOPAYMENTS_PRODUCT_LINK = 'https://woocommerce.com/products/woopayments';

/** Formats a currency amount in compact form, e.g. “$1M” or “$500K”. */
function formatCurrencyCompact( amount: number, currencyCode = 'USD' ) {
	const { symbol, symbolPosition } = getCurrencyObject( amount, currencyCode );
	const compact = formatNumberCompact( amount );
	return symbolPosition === 'before' ? `${ symbol }${ compact }` : `${ compact }${ symbol }`;
}

type BenefitLink = { href: string; event: string };

/**
 * A benefit to share with clients. `text` may wrap words in tags named after
 * the keys of `links`, which render as external links.
 */
type Benefit = { id: string; text: string; links?: Record< string, BenefitLink > };

function getBenefits(): Benefit[][] {
	return [
		[
			{
				id: 'countries',
				text: __(
					'WooPayments is available in <a>38 countries</a> and accepts payments in 135+ currencies, no other extensions needed.'
				),
				links: {
					a: {
						href: 'https://woocommerce.com/document/woopayments/compatibility/countries/#supported-countries',
						event: 'calypso_a4a_woopayments_benefits_countries_link_click',
					},
				},
			},
			{
				id: 'fees',
				text: __(
					'Get started for free. Pay-as-you-go fees per transaction. There are no monthly fees, either. <a>Learn more about WooPayments fees</a>.'
				),
				links: {
					a: {
						href: 'https://woocommerce.com/document/woopayments/fees-and-debits/fees',
						event: 'calypso_a4a_woopayments_benefits_fees_link_click',
					},
				},
			},
			{
				id: 'multi-currency',
				text: __(
					'Multi-Currency support is built-in. Accept payments in 135+ currencies using WooPayments.'
				),
			},
			{
				id: 'payment-methods',
				text: __(
					'Increase conversions by enabling payment methods including <woopay>WooPay</woopay>, <applepay>Apple Pay®</applepay>, <googlepay>Google Pay</googlepay>, <ideal>iDEAL</ideal>, <p24>P24</p24>, <eps>EPS</eps>, and <bancontact>Bancontact</bancontact>.'
				),
				links: {
					woopay: {
						href: 'https://woocommerce.com/woopay-businesses',
						event: 'calypso_a4a_woopayments_benefits_wooPay_link_click',
					},
					applepay: {
						href: 'https://woocommerce.com/document/woopayments/payment-methods/apple-pay',
						event: 'calypso_a4a_woopayments_benefits_applePay_link_click',
					},
					googlepay: {
						href: 'https://woocommerce.com/document/woopayments/payment-methods/google-pay',
						event: 'calypso_a4a_woopayments_benefits_googlePay_link_click',
					},
					ideal: {
						href: 'https://woocommerce.com/woocommerce-payments-ideal',
						event: 'calypso_a4a_woopayments_benefits_iDeal_link_click',
					},
					p24: {
						href: 'https://woocommerce.com/woopayments-p24',
						event: 'calypso_a4a_woopayments_benefits_p24_link_click',
					},
					eps: {
						href: 'https://woocommerce.com/woocommerce-payments-eps',
						event: 'calypso_a4a_woopayments_benefits_eps_link_click',
					},
					bancontact: {
						href: 'https://woocommerce.com/woocommerce-payments-bancontact',
						event: 'calypso_a4a_woopayments_benefits_bancontact_link_click',
					},
				},
			},
			{
				id: 'discount',
				text: sprintf(
					/* translators: %s: discount percentage, e.g. "20%" */
					__(
						'You may be eligible to earn up to a <a>%s discount on Payment Processing Fees</a>.'
					),
					'20%'
				),
				links: {
					a: {
						href: 'https://woocommerce.com/terms-conditions/woopayments-promotion',
						event: 'calypso_a4a_woopayments_benefits_discount_link_click',
					},
				},
			},
		],
		[
			{
				id: 'bnpl',
				text: __(
					'Enable buy now, pay later (BNPL) in one click. Sell more and reach new customers with <a>top BNPL options</a> built into your dashboard (not available in all geographies).'
				),
				links: {
					a: {
						href: 'https://woocommerce.com/buy-now-pay-later',
						event: 'calypso_a4a_woopayments_benefits_bnpl_link_click',
					},
				},
			},
			{
				id: 'workflow',
				text: __(
					'Simplify your workflow. No more logging into third-party payment processor sites — manage everything from the comfort of your store’s dashboard.'
				),
			},
			{
				id: 'payouts',
				text: __(
					'Set a custom payout schedule to get your funds into your bank account as often as you need — daily, weekly, monthly, or even on-demand.'
				),
			},
			{
				id: 'checkout',
				text: __( 'Reduce cart abandonment with a streamlined checkout flow.' ),
			},
		],
	];
}

/** The benefit as plain text, for copying into an email or proposal. */
function toPlainText( text: string ) {
	return text.replace( /<\/?[a-z0-9]+>/gi, '' );
}

function CheckList( { items }: { items: ReactNode[] } ) {
	return (
		<ul className="dashboard-woopayments-landing__checklist">
			{ items.map( ( item, index ) => (
				<li key={ index }>
					<Icon icon={ check } size={ 20 } />
					<span>{ item }</span>
				</li>
			) ) }
		</ul>
	);
}

/** Intrinsic sizes let the browser reserve space before a lazy image loads. */
type LandingImage = { src: string; width: number; height: number };

const EARN_MORE_IMAGE: LandingImage = { src: earnMoreImage, width: 788, height: 581 };
const CART_IMAGE: LandingImage = { src: cartImage, width: 834, height: 525 };
const DEMO_IMAGE: LandingImage = { src: demoImage, width: 963, height: 685 };

function PanelIcon( { src }: { src: string } ) {
	return <img src={ src } width={ 40 } height={ 40 } alt="" loading="lazy" decoding="async" />;
}

function StorySection( {
	id,
	title,
	image,
	isReversed,
	children,
}: {
	id: string;
	title: string;
	image: LandingImage;
	isReversed?: boolean;
	children: ReactNode;
} ) {
	const headingId = `woopayments-landing-${ id }`;
	return (
		<section
			className="dashboard-woopayments-landing__section"
			data-reversed={ isReversed }
			aria-labelledby={ headingId }
		>
			<div className="dashboard-woopayments-landing__graphic" data-graphic={ id }>
				<img
					src={ image.src }
					width={ image.width }
					height={ image.height }
					alt=""
					loading="lazy"
					decoding="async"
				/>
			</div>
			<div className="dashboard-woopayments-landing__copy">
				<Heading id={ headingId } level={ 2 }>
					{ title }
				</Heading>
				{ children }
			</div>
		</section>
	);
}

function SeeFullTermsLink() {
	const { recordTracksEvent } = useAnalytics();
	return (
		<InlineSupportLink
			supportLink={ PROGRAM_TERMS_LINK }
			forceOpenInHelpCenter
			onClick={ () => recordTracksEvent( 'calypso_a4a_woopayments_see_full_terms_click' ) }
		>
			{ __( 'See full terms' ) }
		</InlineSupportLink>
	);
}

function RevenueShare() {
	const existingClientTiers = [
		sprintf(
			/* translators: %s: annual payment volume, e.g. "$1M" */
			__( '%s+ in annual TPV: 3 bps revenue share' ),
			formatCurrencyCompact( 1000000 )
		),
		sprintf(
			/* translators: 1: lower annual payment volume, e.g. "$500K"; 2: upper annual payment volume, e.g. "$1M" */
			__( '%1$s-%2$s in annual TPV: 2 bps revenue share' ),
			formatCurrencyCompact( 500000 ),
			formatCurrencyCompact( 1000000 )
		),
		__( 'Connect eligible stores to A4A within 30 days of joining to participate in these tiers.' ),
	];

	return (
		<section
			className="dashboard-woopayments-landing__block"
			aria-labelledby="woopayments-landing-revenue-share"
		>
			<Heading id="woopayments-landing-revenue-share" level={ 2 }>
				{ __( 'How Revenue Share works' ) }
			</Heading>
			<div className="dashboard-woopayments-landing__columns">
				<div className="dashboard-woopayments-landing__panel">
					<PanelIcon src={ iconStorePlus } />
					<Heading level={ 3 }>{ __( 'For new WooPayments clients you help launch' ) }</Heading>
					<p>
						{ __(
							'Earn a generous 5 basis points (bps) revenue share on all Total Payments Volume (TPV) processed on client sites you onboard after joining Automattic for Agencies.'
						) }
					</p>
					<SeeFullTermsLink />
				</div>
				<div className="dashboard-woopayments-landing__panel">
					<PanelIcon src={ iconStore } />
					<Heading level={ 3 }>
						{ __( 'For existing WooPayments clients you already manage' ) }
					</Heading>
					<p>
						{ __(
							'Bring your current WooPayments-enabled client stores into your Automattic for Agencies dashboard to unlock ongoing revenue share:'
						) }
					</p>
					<CheckList items={ existingClientTiers } />
					<SeeFullTermsLink />
				</div>
			</div>
		</section>
	);
}

function CommissionsAtAGlance() {
	const exampleEarnings = ( amount: number, tpv: number ) =>
		sprintf(
			/* translators: 1: yearly earnings, e.g. "$500"; 2: annual payment volume, e.g. "$1M" */
			__( '%1$s/year on %2$s annual TPV' ),
			formatCurrency( amount, 'USD', { stripZeros: true } ),
			formatCurrencyCompact( tpv )
		);

	const rows = [
		{
			id: 'new',
			siteType: __( 'New Clients' ),
			tpv: __( 'No minimum' ),
			share: __( '5 bps' ),
			earnings: exampleEarnings( 500, 1000000 ),
			requirements: __( 'Standard program terms' ),
		},
		{
			id: 'tier-1',
			siteType: __( 'Pre-existing Clients - Tier 1' ),
			tpv: sprintf(
				/* translators: %s: annual payment volume, e.g. "$1M" */
				__( '%s+/year' ),
				formatCurrencyCompact( 1000000 )
			),
			share: __( '3 bps' ),
			earnings: exampleEarnings( 300, 1000000 ),
			requirements: __( 'Register within 30 days of joining' ),
		},
		{
			id: 'tier-2',
			siteType: __( 'Pre-existing Clients - Tier 2' ),
			tpv: sprintf(
				/* translators: 1: lower annual payment volume, e.g. "$500K"; 2: upper annual payment volume, e.g. "$999.9K" */
				__( '%1$s-%2$s TPV/year' ),
				formatCurrencyCompact( 500000 ),
				formatCurrencyCompact( 999999 )
			),
			share: __( '2 bps' ),
			earnings: exampleEarnings( 100, 500000 ),
			requirements: __( 'Register within 30 days of joining' ),
		},
	];

	return (
		<section
			className="dashboard-woopayments-landing__block"
			aria-labelledby="woopayments-landing-commissions"
		>
			<Heading id="woopayments-landing-commissions" level={ 2 }>
				{ __( 'Commissions at a glance' ) }
			</Heading>
			<div className="dashboard-woopayments-landing__table-wrapper">
				<table className="dashboard-woopayments-landing__table">
					<thead>
						<tr>
							<th scope="col">{ __( 'Site Type' ) }</th>
							<th scope="col">{ __( 'TPV Processed' ) }</th>
							<th scope="col">{ __( 'Revenue Share (bps)' ) }</th>
							<th scope="col">{ __( 'Example Earnings*' ) }</th>
							<th scope="col">{ __( 'Requirements' ) }</th>
						</tr>
					</thead>
					<tbody>
						{ rows.map( ( row ) => (
							<tr key={ row.id }>
								<th scope="row">{ row.siteType }</th>
								<td>{ row.tpv }</td>
								<td>{ row.share }</td>
								<td>{ row.earnings }</td>
								<td>{ row.requirements }</td>
							</tr>
						) ) }
					</tbody>
				</table>
			</div>
			<div className="dashboard-woopayments-landing__footnotes">
				<p>
					{ __(
						'*Example earnings are calculated annually based on the TPV and revenue share rate shown and are subject to change based on your client’s TPV.'
					) }
				</p>
				<p>
					<strong>{ __( 'Legend:' ) }</strong>
					<br />
					{ __( 'bps = basis points (1 bps = 0.01%)' ) }
					<br />
					{ __( 'TPV = Total Payments Volume' ) }
				</p>
			</div>
		</section>
	);
}

function Benefits() {
	const { recordTracksEvent } = useAnalytics();
	const [ hasCopied, setHasCopied ] = useState( false );
	const columns = getBenefits();
	const plainText = columns
		.flat()
		.map( ( benefit ) => `• ${ toPlainText( benefit.text ) }` )
		.join( '\n' );
	const copyRef = useCopyToClipboard< HTMLButtonElement >( plainText, () => {
		recordTracksEvent( 'calypso_a4a_woopayments_copy_benefits_button_click' );
		setHasCopied( true );
	} );

	useEffect( () => {
		if ( ! hasCopied ) {
			return;
		}
		const timeout = setTimeout( () => setHasCopied( false ), 3000 );
		return () => clearTimeout( timeout );
	}, [ hasCopied ] );

	const renderBenefit = ( { text, links }: Benefit ) => {
		if ( ! links ) {
			return text;
		}
		const elements = Object.fromEntries(
			Object.entries( links ).map( ( [ tag, link ] ) => [
				tag,
				<ExternalLink
					key={ tag }
					href={ link.href }
					onClick={ () => recordTracksEvent( link.event ) }
					children={ null }
				/>,
			] )
		);
		return createInterpolateElement( text, elements );
	};

	return (
		<section
			className="dashboard-woopayments-landing__block"
			aria-labelledby="woopayments-landing-benefits"
		>
			<div className="dashboard-woopayments-landing__block-header">
				<Heading id="woopayments-landing-benefits" level={ 2 }>
					{ __( 'Benefits to share with your client' ) }
				</Heading>
				<Button
					ref={ copyRef }
					__next40pxDefaultSize
					variant="secondary"
					size="compact"
					icon={ hasCopied ? check : copy }
				>
					{ hasCopied ? __( 'Copied!' ) : __( 'Copy benefits' ) }
				</Button>
			</div>
			<div className="dashboard-woopayments-landing__columns">
				{ columns.map( ( column, index ) => (
					<CheckList key={ index } items={ column.map( renderBenefit ) } />
				) ) }
			</div>
		</section>
	);
}

/** The program story: what partners earn, how it works, and what to tell clients. */
export function WooPaymentsLandingStory() {
	const { recordTracksEvent } = useAnalytics();
	const { openContactForm } = useContactSupport();

	return (
		<div className="dashboard-woopayments-landing__story">
			<StorySection
				id="earn-more"
				title={ __( 'Earn more from every project' ) }
				image={ EARN_MORE_IMAGE }
			>
				<p>
					{ __(
						'Every client you serve with WooPayments can help accelerate your agency’s revenue. Simply connect the Automattic for Agencies plugin once WooPayments is active, and we’ll take care of the rest.'
					) }
				</p>
				<ButtonStack justify="flex-start" expanded={ false }>
					<Button
						__next40pxDefaultSize
						variant="secondary"
						href={ PROGRAM_INCENTIVES_LINK }
						target="_blank"
						rel="noopener noreferrer"
						icon={ external }
						iconPosition="right"
						onClick={ () =>
							recordTracksEvent( 'calypso_a4a_woopayments_view_details_button_click' )
						}
					>
						{ __( 'View details and start earning' ) }
					</Button>
				</ButtonStack>
			</StorySection>

			<RevenueShare />
			<CommissionsAtAGlance />

			<StorySection id="about" title={ __( 'About WooPayments' ) } image={ CART_IMAGE } isReversed>
				<p>
					{ __(
						'With WooPayments, you can collect payments, track cash flow, handle disputes, and manage recurring revenue directly from your store’s dashboard — without needing to log into a third-party platform.'
					) }
				</p>
				<p>
					{ __(
						'WooPayments simplifies the payment process for you and your customers, leaving you with more time to focus on growing your business. This fully integrated solution is the only payment method designed exclusively for WooCommerce, by Woo.'
					) }
				</p>
			</StorySection>

			<Benefits />

			<StorySection
				id="demo"
				title={ __( 'Still undecided if WooPayments is right for your clients?' ) }
				image={ DEMO_IMAGE }
			>
				<p>
					{ createInterpolateElement(
						__(
							'Explore all of WooPayments’ benefits, browse the technical documentation, and <a>try the demo</a> to see it in action.'
						),
						{
							a: (
								<ExternalLink
									href={ WOOPAYMENTS_PRODUCT_LINK }
									onClick={ () =>
										recordTracksEvent( 'calypso_a4a_woopayments_try_demo_button_click' )
									}
									children={ null }
								/>
							),
						}
					) }
				</p>
				<ButtonStack justify="flex-start" expanded={ false } wrap>
					<Button
						__next40pxDefaultSize
						variant="primary"
						onClick={ () => {
							recordTracksEvent( 'calypso_a4a_woopayments_contact_us_to_learn_more_button_click' );
							openContactForm();
						} }
					>
						{ __( 'Contact us to learn more' ) }
					</Button>
					<Button
						__next40pxDefaultSize
						variant="secondary"
						href={ WOOPAYMENTS_PRODUCT_LINK }
						target="_blank"
						rel="noopener noreferrer"
						icon={ external }
						iconPosition="right"
						onClick={ () =>
							recordTracksEvent( 'calypso_a4a_woopayments_explore_on_woocommerce_button_click' )
						}
					>
						{ __( 'Explore on WooCommerce.com' ) }
					</Button>
				</ButtonStack>
			</StorySection>
		</div>
	);
}

/** The tinted hero and headline that open the landing page and the Learn more modal. */
export function WooPaymentsLandingIntro( {
	heroTitle,
	children,
}: {
	/** Shown over the hero when the intro opens in a modal. */
	heroTitle?: string;
	/** Actions shown under the summary. */
	children?: ReactNode;
} ) {
	return (
		<>
			<div className="dashboard-woopayments-landing__hero">
				{ heroTitle && (
					<Heading className="dashboard-woopayments-landing__hero-title" level={ 1 }>
						{ heroTitle }
					</Heading>
				) }
				<img
					className="dashboard-woopayments-landing__hero-image"
					src={ ccImage }
					width={ 1206 }
					height={ 758 }
					alt=""
				/>
			</div>
			<div className="dashboard-woopayments-landing__intro">
				<img
					className="dashboard-woopayments-landing__logo"
					src={ wooPaymentsLogo }
					alt="WooPayments"
				/>
				<Heading id="woopayments-landing-title" level={ 2 }>
					{ __( 'Transform your clients’ success into real agency revenue' ) }
				</Heading>
				<Text as="p" className="dashboard-woopayments-landing__summary">
					{ __(
						'As an Automattic for Agencies partner, every WooPayments transaction creates new earning potential for your business. Unlock exclusive, built-in commissions just for helping your clients grow — whether you’re onboarding new stores or deepening relationships with those you already support.'
					) }
				</Text>
				{ children }
			</div>
		</>
	);
}

/**
 * The WooPayments program landing page, shown until the agency connects its
 * first WooPayments site.
 */
export default function WooPaymentsLanding( { cta }: { cta: ReactNode } ) {
	return (
		<section
			className="dashboard-woopayments-landing"
			data-context="page"
			aria-labelledby="woopayments-landing-title"
		>
			<WooPaymentsLandingIntro>
				<div className="dashboard-woopayments-landing__cta">{ cta }</div>
			</WooPaymentsLandingIntro>
			<WooPaymentsLandingStory />
		</section>
	);
}
