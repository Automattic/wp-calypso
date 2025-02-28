import {
	WPCOM_DIFM_LITE,
	getPlan,
	isBusiness,
	isPremium,
	isEcommerce,
	isPro,
	getDIFMTieredPriceDetails,
	PLAN_PREMIUM,
	PLAN_BUSINESS,
	getFeatureByKey,
} from '@automattic/calypso-products';
import { Gridicon } from '@automattic/components';
import { useHasEnTranslation } from '@automattic/i18n-utils';
import { NextButton } from '@automattic/onboarding';
import styled from '@emotion/styled';
import { Button } from '@wordpress/components';
import { formatCurrency, numberFormat, useTranslate } from 'i18n-calypso';
import { useEffect, useRef, useState, useCallback } from 'react';
import AsyncLoad from 'calypso/components/async-load';
import QueryProductsList from 'calypso/components/data/query-products-list';
import FoldableFAQComponent from 'calypso/components/foldable-faq';
import FormattedHeader from 'calypso/components/formatted-header';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import scrollIntoViewport from 'calypso/lib/scroll-into-viewport';
import { CHARACTER_LIMIT } from 'calypso/signup/steps/website-content/section-types/constants';
import { useSelector } from 'calypso/state';
import {
	getProductBySlug,
	getProductCost,
	getProductCurrencyCode,
} from 'calypso/state/products-list/selectors';
import { getSitePlan } from 'calypso/state/sites/selectors';
import type { TranslateResult } from 'i18n-calypso';

import './difm-landing.scss';

const Placeholder = styled.span`
	padding: 0 60px;
	animation: loading-fade 800ms ease-in-out infinite;
	background-color: var( --color-neutral-10 );
	color: transparent;
	min-height: 20px;
	@keyframes loading-fade {
		0% {
			opacity: 0.5;
		}
		50% {
			opacity: 1;
		}
		100% {
			opacity: 0.5;
		}
	}
`;

const Wrapper = styled.div`
	display: flex;
	align-items: flex-start;
	padding: 32px;
	max-width: 1040px;
	margin: 0 auto;

	.difmStartingPoint & {
		padding: 12px;
	}
`;

const ContentSection = styled.div`
	flex: 1;
	padding-right: 10px;
	width: 50%;
`;

const ImageSection = styled.div`
	min-width: 540px;
	width: 50%;
	height: 562px;
	display: flex;
	align-items: center;
	justify-content: center;
	@media ( max-width: 960px ) {
		display: none;
	}
`;

const Header = styled( FormattedHeader )`
	margin: 0 0 24px 0 !important;
	.formatted-header__title {
		font-size: 2.75rem !important;
		margin-bottom: 16px !important;
		line-height: 3rem;
	}
	.formatted-header__subtitle {
		font-size: 1rem;
	}
`;

const FAQExpander = styled( Button )`
	align-self: center;
	background: var( --studio-gray-0 );
	font-size: 0.875rem;
	padding: 12px 0;
	width: 500px;
	height: 48px;
	text-align: center;
	&&& {
		justify-content: center;
	}
	@media ( max-width: 660px ) {
		width: 90vw;
	}
`;

const FAQHeader = styled.h1`
	font-size: 2rem;
	text-align: center;
	margin: 48px 0;
`;

const FAQSection = styled.div`
	display: flex;
	flex-direction: column;
`;

const FoldableFAQ = styled( FoldableFAQComponent )`
	border: 1px solid #e9e9ea;
	padding: 0;
	border-radius: 4px;
	margin-bottom: 24px;
	.foldable-faq__question {
		padding: 24px 16px 24px 24px;
		flex-direction: row-reverse;
		width: 100%;
		svg {
			margin-inline-end: 0;
			margin-inline-start: auto;
			flex-shrink: 0;
		}
		.foldable-faq__question-text {
			padding-inline-start: 0;
			font-size: 1.125rem;
		}
	}
	&.is-expanded {
		border: 2px solid var( --studio-wordpress-blue-50 );
		.foldable-faq__answer {
			margin: 0 16px 24px 0;
			ul {
				margin: 0 0 0 16px;
			}
		}
	}
	&:not( .is-expanded ) .foldable-faq__question:focus {
		box-shadow: 0 0 0 var( --studio-wordpress-blue-50, var( --wp-admin-theme-color, #3858e9 ) );
		outline: 3px solid transparent;
	}
	.foldable-faq__answer {
		padding: 0 16px 0 24px;
		border: 0;
	}
`;

const CTASectionWrapper = styled.div`
	display: flex;
	align-items: center;
	justify-content: flex-start;
	gap: 18px;
	margin: 2rem 0;
	.components-button.is-primary {
		border-radius: 4px;
		font-size: 0.875rem;
		font-weight: 500;
		justify-content: center;
		&:focus {
			border: none;
			box-shadow: none;
			outline: solid 2px var( --color-accent-60 );
			outline-offset: 2px;
		}
	}
	.components-button.is-secondary {
		border-radius: 4px;
		box-shadow: inset 0 0 0 1px
			var( --studio-wordpress-blue-50, var( --wp-admin-theme-color, #3858e9 ) );
		outline: 1px solid transparent;
		white-space: nowrap;
		color: var( --studio-wordpress-blue-50, var( --wp-admin-theme-color, #3858e9 ) );
		background: transparent;
		border: none;
		&:focus {
			border: none;
			box-shadow: none;
			outline: solid 2px var( --color-accent-60 );
			outline-offset: 2px;
		}
	}
`;

const StepContainer = styled.div`
	display: flex;
	gap: 20px;
	margin-top: 0;
`;

const ProgressLine = styled.div`
	width: 1px;
	background: var( --studio-gray-5 );
	height: 100%;
`;

const VerticalStepProgress = styled.div`
	display: flex;
	flex-direction: column;
	margin: 36px 0 12px 0;
	${ StepContainer }:last-child {
		${ ProgressLine } {
			display: none;
		}
	}
`;

const IndexContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
`;

const Index = styled.div`
	border-radius: 50%;
	border: 1px solid var( --studio-gray-5 );
	color: var( --studio-gray-30 );
	font-size: 1.125rem;
	height: 20px;
	line-height: 20px;
	padding: 10px;
	text-align: center;
	width: 20px;
`;
const Title = styled.div`
	margin-bottom: 6px;
	color: var( --studio-gray-100 );
	font-weight: 500;
`;
const Description = styled.div`
	color: var( --studio-gray-60 );
	padding-bottom: 18px;
	font-size: 0.875rem;
`;

const hasHigherPlan = ( currentPlan: string, plan: typeof PLAN_PREMIUM | typeof PLAN_BUSINESS ) => {
	const planMatchers =
		plan === PLAN_PREMIUM
			? [ isPremium, isBusiness, isEcommerce, isPro ]
			: [ isBusiness, isEcommerce, isPro ];

	return planMatchers.some( ( planMatcher ) =>
		planMatcher( {
			productSlug: currentPlan,
		} )
	);
};

const Step = ( {
	index,
	title,
	description,
}: {
	index: TranslateResult;
	title: TranslateResult;
	description: TranslateResult;
} ) => {
	return (
		<StepContainer>
			<IndexContainer>
				<Index>{ index }</Index>
				<ProgressLine />
			</IndexContainer>
			<div>
				<Title>{ title }</Title>
				<Description>{ description }</Description>
			</div>
		</StepContainer>
	);
};

export default function DIFMLanding( {
	showNewOrExistingSiteChoice,
	onPrimarySubmit,
	onSecondarySubmit,
	siteId,
	isStoreFlow,
}: {
	onPrimarySubmit: () => void;
	onSecondarySubmit?: () => void;
	showNewOrExistingSiteChoice: boolean;
	siteId?: number | null;
	isStoreFlow: boolean;
} ) {
	const requiredProductSlugs = [ PLAN_PREMIUM, WPCOM_DIFM_LITE, PLAN_BUSINESS ];
	const translate = useTranslate();
	const hasEnTranslation = useHasEnTranslation();

	const product = useSelector( ( state ) => getProductBySlug( state, WPCOM_DIFM_LITE ) );
	const productCost = product?.cost;

	const planSlug = isStoreFlow ? PLAN_BUSINESS : PLAN_PREMIUM;
	const planObject = getPlan( planSlug );
	const planTitle = planObject?.getTitle();
	const planCostInteger = useSelector( ( state ) => getProductCost( state, planSlug ) );
	const planStorageSlug = planObject?.getStorageFeature?.();
	const planStorageString = planStorageSlug ? getFeatureByKey( planStorageSlug )?.getTitle() : '';

	const difmTieredPriceDetails = getDIFMTieredPriceDetails( product );
	const extraPageCost = difmTieredPriceDetails?.perExtraPagePrice;

	// This is used in a FAQ item.
	const businessPlanCostInteger = useSelector( ( state ) =>
		getProductCost( state, PLAN_BUSINESS )
	);

	const currencyCode = useSelector( ( state ) => getProductCurrencyCode( state, WPCOM_DIFM_LITE ) );
	const hasPriceDataLoaded =
		productCost && extraPageCost && planCostInteger && businessPlanCostInteger && currencyCode;

	const displayCost = hasPriceDataLoaded
		? formatCurrency( productCost, currencyCode, { stripZeros: true } )
		: '';

	const planCost = hasPriceDataLoaded
		? formatCurrency( planCostInteger, currencyCode, { stripZeros: true } )
		: '';

	const extraPageDisplayCost = hasPriceDataLoaded
		? formatCurrency( extraPageCost, currencyCode, {
				stripZeros: true,
				isSmallestUnit: true,
		  } )
		: '';

	const businessPlanCost = hasPriceDataLoaded
		? formatCurrency( businessPlanCostInteger, currencyCode, { stripZeros: true } )
		: '';

	const faqHeader = useRef( null );
	const [ isFAQSectionOpen, setIsFAQSectionOpen ] = useState( false );
	const onFAQButtonClick = useCallback( () => {
		setIsFAQSectionOpen( ( isFAQSectionOpen ) => ! isFAQSectionOpen );
	}, [ setIsFAQSectionOpen ] );

	useEffect( () => {
		if ( isFAQSectionOpen && faqHeader.current ) {
			scrollIntoViewport( faqHeader.current, {
				behavior: 'smooth',
				scrollMode: 'if-needed',
			} );
		}
	}, [ isFAQSectionOpen ] );

	const headerTextTranslateArgs = {
		components: {
			PriceWrapper: ! hasPriceDataLoaded ? <Placeholder /> : <span />,
			sup: <sup />,
		},
		args: {
			displayCost,
			days: 4,
		},
	};
	const headerText = isStoreFlow
		? translate(
				'Let us build your store in %(days)d days for {{PriceWrapper}}%(displayCost)s{{/PriceWrapper}}{{sup}}*{{/sup}}',
				headerTextTranslateArgs
		  )
		: translate(
				'Let us build your site in %(days)d days for {{PriceWrapper}}%(displayCost)s{{/PriceWrapper}}{{sup}}*{{/sup}}',
				headerTextTranslateArgs
		  );

	const currentPlan = useSelector( ( state ) => ( siteId ? getSitePlan( state, siteId ) : null ) );
	const hasCurrentPlanOrHigherPlan = currentPlan?.product_slug
		? hasHigherPlan( currentPlan.product_slug, planSlug )
		: false;

	const subHeaderText = hasCurrentPlanOrHigherPlan
		? translate(
				'{{sup}}*{{/sup}}One time fee. A WordPress.com professional will create layouts for up to %(freePages)d pages of your site. It only takes 4 simple steps:',
				{
					args: {
						freePages: 5,
					},
					components: {
						sup: <sup />,
					},
				}
		  )
		: translate(
				'{{sup}}*{{/sup}}One time fee, plus an additional purchase of the %(plan)s plan. A WordPress.com professional will create layouts for up to %(freePages)d pages of your site. It only takes 4 simple steps:',
				{
					args: {
						plan: planTitle ?? '',
						freePages: 5,
					},
					components: {
						sup: <sup />,
					},
				}
		  );

	const faqPlanCostOldCopy = translate(
		'The service costs %(displayCost)s, plus an additional %(planCost)s for the %(planTitle)s plan, which offers fast, secure hosting, video embedding, %(storage)s of storage, a free domain for one year, and live chat support.',
		{
			args: {
				displayCost,
				planTitle: planTitle ?? '',
				planCost,
				storage: planStorageString,
			},
		}
	);
	const faqPlanCostNewCopy = translate(
		'The service costs %(displayCost)s, plus an additional %(planCost)s for the %(planTitle)s plan, which offers fast, secure hosting, video embedding, %(storage)s of storage, a free domain for one year, and expert support from our team.',
		{
			args: {
				displayCost,
				planTitle: planTitle ?? '',
				planCost,
				storage: planStorageString,
			},
		}
	);

	let faqRevisionsAnswer = translate(
		'While this service does not include revisions, once you’ve received your completed site, you can modify everything using the WordPress editor – colors, text, images, adding new pages, and anything else you’d like to tweak. ' +
			'Furthermore, our %s plan offers live chat and priority email support if you need assistance.',
		{
			args: [ planTitle || '' ],
		}
	);
	if ( planSlug === PLAN_BUSINESS ) {
		const isCopyTranslated = hasEnTranslation(
			'While this service does not include revisions, once you’ve received your completed site, you can modify everything using the WordPress editor – colors, text, images, adding new pages, and anything else you’d like to tweak. ' +
				'Furthermore, our %s plan offers 24X7 priority support from our experts if you need assistance.'
		);
		if ( isCopyTranslated ) {
			faqRevisionsAnswer = translate(
				'While this service does not include revisions, once you’ve received your completed site, you can modify everything using the WordPress editor – colors, text, images, adding new pages, and anything else you’d like to tweak. ' +
					'Furthermore, our %s plan offers 24X7 priority support from our experts if you need assistance.',
				{
					args: [ planTitle || '' ],
				}
			);
		}
	}
	if ( planSlug === PLAN_PREMIUM ) {
		const isCopyTranslated = hasEnTranslation(
			'While this service does not include revisions, once you’ve received your completed site, you can modify everything using the WordPress editor – colors, text, images, adding new pages, and anything else you’d like to tweak. ' +
				'Furthermore, our %s plan offers fast support from our experts if you need assistance.'
		);
		if ( isCopyTranslated ) {
			faqRevisionsAnswer = translate(
				'While this service does not include revisions, once you’ve received your completed site, you can modify everything using the WordPress editor – colors, text, images, adding new pages, and anything else you’d like to tweak. ' +
					'Furthermore, our %s plan offers fast support from our experts if you need assistance.',
				{
					args: [ planTitle || '' ],
				}
			);
		}
	}

	return (
		<>
			{ ! hasPriceDataLoaded && (
				<QueryProductsList productSlugList={ requiredProductSlugs } type="partial" />
			) }
			<Wrapper>
				<ContentSection>
					<Header
						brandFont
						align="left"
						headerText={ headerText }
						subHeaderText={ subHeaderText }
					/>
					<VerticalStepProgress>
						<Step
							index={ translate( '1' ) }
							title={ translate( 'Submit your business information' ) }
							description={ translate( 'Optionally provide your profiles to be found on social.' ) }
						/>

						<Step
							index={ translate( '2' ) }
							title={ translate( 'Select your design and pages' ) }
							description={ translate( 'Can’t decide? Let our experts choose the best design!' ) }
						/>

						<Step
							index={ translate( '3' ) }
							title={ translate( 'Complete the purchase' ) }
							description={ translate( 'Try risk free with a %(days)d-day money back guarantee.', {
								args: {
									days: 14,
								},
								comment: 'the arg is the refund period in days',
							} ) }
						/>

						<Step
							index={ translate( '4' ) }
							title={ translate( 'Submit content for your new website' ) }
							description={
								isStoreFlow
									? translate( 'Products can be added later with the WordPress editor.' )
									: translate( 'Content can be edited later with the WordPress editor.' )
							}
						/>
					</VerticalStepProgress>
					<p>
						{ translate(
							'Share your finished site with the world in %(days)d business days or less!',
							{
								args: {
									days: 4,
								},
							}
						) }
					</p>
					{ showNewOrExistingSiteChoice ? (
						<CTASectionWrapper>
							<NextButton onClick={ onPrimarySubmit }>
								{ translate( 'Use an existing site' ) }
							</NextButton>
							<span>{ translate( 'or' ) }</span>
							<NextButton onClick={ onSecondarySubmit } variant="secondary">
								{ translate( 'Start a new site' ) }
							</NextButton>
						</CTASectionWrapper>
					) : (
						<CTASectionWrapper>
							<NextButton onClick={ onPrimarySubmit }>{ translate( 'Get started' ) }</NextButton>
						</CTASectionWrapper>
					) }
				</ContentSection>
				<ImageSection>
					<AsyncLoad
						require="./site-build-showcase"
						placeholder={ <LoadingEllipsis /> }
						isStoreFlow={ isStoreFlow }
					/>
				</ImageSection>
			</Wrapper>

			<FAQSection>
				<FAQExpander
					ref={ faqHeader }
					onClick={ onFAQButtonClick }
					icon={ <Gridicon icon={ isFAQSectionOpen ? 'chevron-up' : 'chevron-down' } /> }
				>
					{ isFAQSectionOpen
						? translate( 'Hide Frequently Asked Questions' )
						: translate( 'Show Frequently Asked Questions' ) }
				</FAQExpander>
				{ isFAQSectionOpen && (
					<>
						{ /* eslint-disable-next-line wpcalypso/jsx-classname-namespace */ }
						<FAQHeader className="wp-brand-font">
							{ translate( 'Frequently Asked Questions' ) }{ ' ' }
						</FAQHeader>
						<FoldableFAQ
							id="faq-1"
							expanded
							question={ translate(
								'What is the Express Website Design Service, and who is it for?'
							) }
						>
							<p>
								{ translate(
									'Our website-building service is for anyone who wants a polished website fast: small businesses, personal websites, bloggers, clubs or organizations, and more. ' +
										"Just answer a few questions, submit your content, and we'll handle the rest. " +
										"Click the button above to start, and you'll receive your customized 5-page site within 4 business days!"
								) }
							</p>
						</FoldableFAQ>
						<FoldableFAQ id="faq-2" question={ translate( 'How much does it cost?' ) }>
							<p>
								{ hasEnTranslation(
									'The service costs %(displayCost)s, plus an additional %(planCost)s for the %(planTitle)s plan, which offers fast, secure hosting, video embedding, %(storage)s of storage, a free domain for one year, and fast support from our expert team.'
								)
									? faqPlanCostNewCopy
									: faqPlanCostOldCopy }
							</p>
						</FoldableFAQ>
						{ isStoreFlow && (
							<FoldableFAQ
								id="faq-2-1"
								question={ translate( 'What does my store setup include?' ) }
							>
								<p>
									{ translate(
										'Your purchase includes the setup of the WooCommerce shop landing page, cart, checkout, and my account pages, along with additional pages you choose while signing up. ' +
											'Please note, individual product setup, payments, taxes, shipping, and other WooCommerce extensions or settings are not included. ' +
											'You can set these up later, support is happy to help if you have questions.'
									) }
								</p>
							</FoldableFAQ>
						) }
						<FoldableFAQ
							id="faq-3"
							question={ translate( 'Can I purchase additional pages if I need more than five?' ) }
						>
							<p>
								{ translate(
									'Yes, extra pages can be purchased for %(extraPageDisplayCost)s each.',
									{
										args: {
											extraPageDisplayCost,
										},
									}
								) }
							</p>
						</FoldableFAQ>
						<FoldableFAQ
							id="faq-4"
							question={ translate( "What if I don't have enough images or content?" ) }
						>
							<p>
								{ translate(
									"Don't worry if you don't have images or content for every page. " +
										"After checkout, you'll have an option to opt into AI text creation. " +
										'Our design team can select images and use AI to create your site content, all of which you can edit later using the editor. ' +
										"If you select the blog page during sign up, we'll even create three blog posts for you to get you started!"
								) }
							</p>
						</FoldableFAQ>
						<FoldableFAQ id="faq-5" question={ translate( 'When will you contact me?' ) }>
							<p>
								{ translate(
									'After you check out, you’ll fill out a content upload form that includes any design preferences and reference sites. ' +
										"While we can't guarantee an exact match, we'll consider all your feedback during site construction, and you'll receive an email when your new site is ready — always within four business days."
								) }
							</p>
						</FoldableFAQ>
						<FoldableFAQ
							id="faq-6"
							question={ translate( 'What will my completed website look like?' ) }
						>
							<p>
								{ translate(
									'Each website is unique, mobile-friendly, and customized to your brand and content. ' +
										'With a 97% satisfaction rate, we are confident that you will love your new site, just like hundreds of customers before you. ' +
										'Additionally, we offer a 14-day refund window, giving you peace of mind.'
								) }
							</p>
						</FoldableFAQ>
						<FoldableFAQ id="faq-7" question={ translate( 'How many revisions are included?' ) }>
							<p>{ faqRevisionsAnswer }</p>
						</FoldableFAQ>
						<FoldableFAQ
							id="faq-8"
							question={ translate( 'What happens to my existing content?' ) }
						>
							<p>
								{ translate(
									'If you choose to use your current WordPress.com site, your existing content will remain untouched. ' +
										"We'll create new pages with your provided content while applying a new, customized theme. However, we won't edit any existing content on your site's pages."
								) }
							</p>
						</FoldableFAQ>
						<FoldableFAQ id="faq-9" question={ translate( 'What are the content guidelines?' ) }>
							<p>
								{ translate(
									'{{strong}}Fresh Content Only:{{/strong}} Please provide original content rather than requesting migrations or content from existing pages, external websites, or files.',
									{
										components: {
											strong: <strong />,
										},
									}
								) }
							</p>
							<p>
								{ translate(
									"{{strong}}Timely Submission:{{/strong}} Submit your content {{strong}}within %(refundPeriodDays)d days{{/strong}} of purchase to keep things on track. If we don't receive it in time, we'll use AI-generated text and stock images based on your search terms to bring your site to life.",
									{
										components: {
											strong: <strong />,
										},
										args: {
											refundPeriodDays: 14,
										},
									}
								) }
							</p>
							<p>
								{ translate(
									'{{strong}}Bite-sized Content:{{/strong}} Keep each page under %s characters. Longer content will be trimmed using AI to ensure everything looks great.',
									{
										components: {
											strong: <strong />,
										},
										args: [ numberFormat( CHARACTER_LIMIT ) ],
									}
								) }
							</p>
							<p>
								{ translate(
									"{{strong}}Design Approach:{{/strong}} We follow established design guidelines while customizing your site to reflect your brand. With your logo, colors, and style preferences, we'll create a professional site that captures your essence using our curated design elements.",
									{
										components: {
											strong: <strong />,
										},
									}
								) }
							</p>
							<p>
								{ translate(
									"{{strong}}Stay Connected:{{/strong}} After you submit your content, we'll review it. If everything meets our guidelines, we'll notify you when your site is ready for launch. If adjustments are needed, we'll reach out.",
									{
										components: {
											strong: <strong />,
										},
									}
								) }
							</p>
							<p>
								{ translate(
									"{{strong}}Perfect As-Is:{{/strong}} We aim to get it right the first time! While revisions aren't included, you can always make updates later using the WordPress editor.",
									{
										components: {
											strong: <strong />,
										},
									}
								) }
							</p>
							<p>
								{ translate(
									"{{strong}}Plugin Potential:{{/strong}} The initial setup doesn't include every feature, but it's a great starting point. Add options like appointments, courses, property listings, memberships, payments, animations, and more after we finish your site. Our Happiness Engineers can make recommendations based on your plan.",
									{
										components: {
											strong: <strong />,
										},
									}
								) }
							</p>
							<p>
								{ translate(
									"{{strong}}Custom Requests:{{/strong}} We focus on attractive and functional designs, but we can't accommodate very specific layout requests or exact matches to designs. For fully custom solutions or pixel-perfect recreations, we can connect you with an expert WordPress agency partner, with projects starting at $5,000.",
									{
										components: {
											strong: <strong />,
										},
									}
								) }
							</p>
						</FoldableFAQ>
						<FoldableFAQ id="faq-10" question={ translate( 'Can I use my existing domain name?' ) }>
							<p>
								{ translate(
									'Yes, our support team will help you connect your existing domain name to your site after the build is complete.'
								) }
							</p>
						</FoldableFAQ>
						{ ! isStoreFlow && (
							<FoldableFAQ id="faq-11" question={ translate( 'Can I have a store set up?' ) }>
								<>
									<p>
										{ translate(
											'We offer an ecommerce store setup option which includes setup of the WooCommerce shop landing page, cart, checkout, and my account pages, along with additional pages you choose while signing up. ' +
												'Please note, individual product setup, payments, taxes, shipping, and other WooCommerce extensions or settings are not included. You can set these up later, support is happy to help if you have questions. ' +
												'An additional purchase of the %(businessPlanName)s plan, costing %(businessPlanCost)s, is required for a store site.',
											{
												args: {
													businessPlanName: getPlan( PLAN_BUSINESS )?.getTitle() || '',
													businessPlanCost,
												},
											}
										) }
									</p>
									<Button
										variant="primary"
										onClick={ () => ( window.location.href = '/start/do-it-for-me-store' ) }
									>
										{ translate( 'Get started' ) }
									</Button>
								</>
							</FoldableFAQ>
						) }
					</>
				) }
			</FAQSection>
		</>
	);
}
