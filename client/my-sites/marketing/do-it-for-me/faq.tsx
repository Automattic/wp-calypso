import { getPlan, PLAN_BUSINESS, PLAN_PREMIUM } from '@automattic/calypso-products';
import { Gridicon } from '@automattic/components';
import { useHasEnTranslation } from '@automattic/i18n-utils';
import styled from '@emotion/styled';
import { Button } from '@wordpress/components';
import { RefObject } from '@wordpress/element';
import { numberFormat, useTranslate } from 'i18n-calypso';
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import scrollIntoViewport from 'calypso/lib/scroll-into-viewport';
import { CHARACTER_LIMIT } from 'calypso/signup/steps/website-content/section-types/constants';
import FoldableFAQComponent from '../../../components/foldable-faq';
import { useDIFMPlanInfo } from './use-difm-plan-info';

const FAQHeader = styled.h1`
	font-size: 2rem;
	text-align: center;
	margin: 48px 0;
`;

const FAQSection = styled.div`
	width: 100%;
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

const FoldableFAQ = styled( FoldableFAQComponent )`
	border: 1px solid var( --color-border-subtle );
	padding: 0 !important;
	width: 100%;
	border-radius: 2px;
	margin-bottom: 16px;
	.foldable-faq__question {
		padding: 24px;
		flex-direction: row-reverse;
		width: 100%;
		svg {
			margin-inline-end: 0;
			margin-inline-start: auto;
			flex-shrink: 0;
		}
		.foldable-faq__question-text {
			padding-inline-start: 0;
			font-size: 1rem;
			line-height: 1.5;
		}
	}
	&.is-expanded {
		border: 2px solid var( --studio-wordpress-blue-50 );

		.foldable-faq__question {
			padding-bottom: 16px;
		}

		.foldable-faq__answer {
			margin: 0 24px;
			padding: 0;
			font-size: 0.875rem;
			line-height: 1.5;
			color: var( --studio-gray-60 );

			p {
				margin-bottom: 1.5em;
			}
		}
	}
	&:not( .is-expanded ) .foldable-faq__question:focus {
		box-shadow: 0 0 0 var( --studio-wordpress-blue-50, var( --wp-admin-theme-color, #3858e9 ) );
		outline: 3px solid transparent;
	}
	.foldable-faq__answer {
		border: 0;
	}
`;

const CTASection = styled.div`
	display: flex;
	gap: 16px;
	align-items: center;
	justify-content: center;
	margin-top: 48px;
	margin-bottom: 32px;
`;

interface FAQExpanderProps {
	ref: RefObject< HTMLButtonElement >;
	onClick: () => void;
	isFAQSectionOpen: boolean;
	children: ReactNode;
}

const defaultRenderFAQExpander = ( {
	ref,
	onClick,
	isFAQSectionOpen,
	children,
}: FAQExpanderProps ) => {
	return (
		<FAQExpander
			ref={ ref }
			onClick={ onClick }
			icon={ <Gridicon icon={ isFAQSectionOpen ? 'chevron-up' : 'chevron-down' } /> }
		>
			{ children }
		</FAQExpander>
	);
};

export const DIFMFAQ = ( {
	isStoreFlow,
	siteId,
	ctaSection,
	renderExpanderButton = defaultRenderFAQExpander,
}: {
	isStoreFlow: boolean;
	siteId?: number;
	ctaSection?: ReactNode;
	renderExpanderButton?: typeof defaultRenderFAQExpander;
} ) => {
	const translate = useTranslate();
	const hasEnTranslation = useHasEnTranslation();

	const {
		planTitle,
		planSlug,
		planCost,
		extraPageDisplayCost,
		businessPlanCost,
		displayCost,
		planStorageString,
	} = useDIFMPlanInfo( {
		isStoreFlow,
		siteId,
	} );

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
		<FAQSection>
			<div css={ { textAlign: 'center' } }>
				{ renderExpanderButton( {
					ref: faqHeader,
					onClick: onFAQButtonClick,
					isFAQSectionOpen,
					children: isFAQSectionOpen
						? translate( 'Hide Frequently Asked Questions' )
						: translate( 'Show Frequently Asked Questions' ),
				} ) }
			</div>

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
						<FoldableFAQ id="faq-2-1" question={ translate( 'What does my store setup include?' ) }>
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
							{ translate( 'Yes, extra pages can be purchased for %(extraPageDisplayCost)s each.', {
								args: {
									extraPageDisplayCost,
								},
							} ) }
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
					<FoldableFAQ id="faq-8" question={ translate( 'What happens to my existing content?' ) }>
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
								<p>
									<Button variant="primary" href="/start/do-it-for-me-store">
										{ translate( 'Get started' ) }
									</Button>
								</p>
							</>
						</FoldableFAQ>
					) }
					{ ctaSection && <CTASection>{ ctaSection }</CTASection> }
				</>
			) }
		</FAQSection>
	);
};
