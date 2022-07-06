import { isEnabled } from '@automattic/calypso-config';
import {
	WPCOM_DIFM_LITE,
	getPlan,
	PLAN_WPCOM_PRO,
	PLAN_PREMIUM,
} from '@automattic/calypso-products';
import { Gridicon } from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import { NextButton } from '@automattic/onboarding';
import styled from '@emotion/styled';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import QueryProductsList from 'calypso/components/data/query-products-list';
import FoldableFAQComponent from 'calypso/components/foldable-faq';
import FormattedHeader from 'calypso/components/formatted-header';
import scrollIntoViewport from 'calypso/lib/scroll-into-viewport';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getProductCost, isProductsListFetching } from 'calypso/state/products-list/selectors';
import type { TranslateResult } from 'i18n-calypso';

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
	gap: 96px;
	padding: 12px;
`;

const ContentSection = styled.div`
	flex: 1;
`;

const ImageSection = styled.div`
	width: 540px;
	img {
		width: 100%;
	}
	@media ( max-width: 960px ) {
		display: none;
	}
`;

const Header = styled( FormattedHeader )`
	.formatted-header__title {
		line-height: 3rem;
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
	margin-bottom: 24px;
	.foldable-faq__question {
		padding: 24px 16px 24px 24px;
		flex-direction: row-reverse;
		width: 100%;
		svg {
			margin-inline-end: 0;
			margin-inline-start: auto;
		}
		.foldable-faq__question-text {
			padding-inline-start: 0;
			font-size: 1.125rem;
		}
	}
	&.is-expanded {
		border: 2px solid var( --studio-blue-50 );
		background: linear-gradient(
			180deg,
			rgba( 6, 117, 196, 0.2 ) -44.3%,
			rgba( 255, 255, 255, 0 ) 100%
		);
		.foldable-faq__answer {
			margin: 0 16px 24px 0;
			ul {
				margin: 0 0 0 16px;
			}
		}
	}
	.foldable-faq__answer {
		padding: 0 16px 0 24px;
		border: 0;
	}
`;

const CTASectionWrapper = styled.div`
	display: flex;
	gap: 32px;
	margin: 2rem 0;
`;

const SkipButton = styled( Button )`
	&& {
		color: var( --studio-gray-100 );
		text-decoration: underline;
		font-size: 0.875rem;
		font-weight: 500;
	}
`;

const LinkButton = styled( Button )`
	font-size: 1rem;
`;

const StepContainer = styled.div`
	display: flex;
	gap: 20px;
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
	onSubmit,
	onSkip,
	isInOnboarding = true,
}: {
	onSubmit: () => void;
	onSkip?: () => void;
	isInOnboarding: boolean;
} ) {
	const translate = useTranslate();

	const productCost = useSelector( ( state ) => getProductCost( state, WPCOM_DIFM_LITE ) );
	const currencyCode = useSelector( getCurrentUserCurrencyCode );
	const hasPriceDataLoaded = productCost && currencyCode;
	const isLoading = useSelector( isProductsListFetching );
	const displayCost = hasPriceDataLoaded
		? formatCurrency( productCost, currencyCode, { stripZeros: true } )
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

	const planTitle = isEnabled( 'plans/pro-plan' )
		? getPlan( PLAN_WPCOM_PRO )?.getTitle()
		: getPlan( PLAN_PREMIUM )?.getTitle();

	const headerText = translate(
		'Hire a professional to set up your site for {{PriceWrapper}}%(displayCost)s{{/PriceWrapper}}{{sup}}*{{/sup}}',
		{
			components: {
				PriceWrapper: isLoading ? <Placeholder /> : <span />,
				sup: <sup />,
			},
			args: {
				displayCost,
			},
		}
	);

	return (
		<>
			{ ! hasPriceDataLoaded && <QueryProductsList persist /> }
			<Wrapper>
				<ContentSection>
					<Header
						align={ 'left' }
						headerText={ headerText }
						subHeaderText={ translate(
							'{{sup}}*{{/sup}}One time fee, plus a one year subscription of the %(plan)s plan. A WordPress.com professional will create layouts for up to %(freePages)d pages of your site. It only takes 4 simple steps:',
							{
								args: {
									plan: planTitle,
									freePages: 5,
								},
								components: {
									sup: <sup />,
								},
							}
						) }
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
							description={ translate( 'Content can be edited later with the help of support.' ) }
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
					<CTASectionWrapper>
						<NextButton onClick={ onSubmit } isPrimary={ true }>
							{ translate( 'Hire a Professional' ) }
						</NextButton>
						{ isInOnboarding && (
							<SkipButton isLink={ true } onClick={ onSkip }>
								{ translate( 'Skip for now' ) }
							</SkipButton>
						) }
					</CTASectionWrapper>
				</ContentSection>
				<ImageSection>
					<img
						alt="website examples"
						src="https://assets.a8c.vercel.app/static/difm-lite/hero-lockup.png"
					></img>
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
							expanded={ true }
							question={ translate( 'What is Do It For Me: Website Design Service?' ) }
						>
							<p>
								{ translate(
									'This service was created for customers who would like to hire a professional to set up their website. Our professional builders have expert knowledge of the WordPress editor, themes, and available blocks; they take advantage of all the best options for your new site build. Once you’ve provided us with your content, we’ll create custom layouts for each page of your website and add your content to each of them. You will receive an email with a link to your finished website within 4 business days. You can then edit all of the content of the site using the WordPress editor. Add as many new pages or posts as you need, and contact WordPress.com support with any questions regarding how to edit or further customize your new site!'
								) }
							</p>
						</FoldableFAQ>
						<FoldableFAQ id="faq-2" question={ translate( 'How do I get started?' ) }>
							<ul>
								<li>
									{ translate( 'Click {{a}}Hire a Professional{{/a}} to begin.', {
										components: {
											a: <LinkButton isLink={ true } onClick={ onSubmit } />,
										},
									} ) }
								</li>
								<li>
									{ translate(
										'Choose {{b}}New site{{/b}} to begin a new site or {{b}}Existing WordPress.com{{/b}} site if you’d like to use an existing site on your account. (Note that all existing website content will be deleted from the site so we can start fresh).',
										{
											components: {
												b: <b />,
											},
										}
									) }
								</li>
								<li>
									{ translate(
										'Submit your business information and optionally add your social media profiles.'
									) }
								</li>
								<li>
									{ translate(
										'Select your design from our catalog of professionally designed themes, or select {{b}}Let us choose{{/b}} to let our professionals select the best design for your site (recommended).',
										{
											components: {
												b: <b />,
											},
										}
									) }
								</li>
								<li>
									{ translate(
										'Select up to five page types to use for your new site (About, Services, Contact, etc).'
									) }
								</li>
								<li>{ translate( 'Complete the purchase at Checkout.' ) }</li>
								<li>
									{ translate(
										'Submit the content for your new website, adding text and images (optional) for each page. You can always edit this content on the site later using the WordPress editor.'
									) }
								</li>
								<li>
									{ translate( 'Receive your finished website in 4 business days or less!' ) }
								</li>
							</ul>
						</FoldableFAQ>
						<FoldableFAQ id="faq-3" question={ translate( 'Who is this service for?' ) }>
							<ul>
								<li>{ translate( 'Small business owners looking to get online quickly.' ) }</li>
								<li>
									{ translate( 'Bloggers wanting some help with their initial site setup.' ) }
								</li>
								<li>{ translate( 'Anyone who could benefit from professional page layouts.' ) }</li>
							</ul>
						</FoldableFAQ>
						<FoldableFAQ id="faq-4" question={ translate( 'How much does the service cost?' ) }>
							<p>
								{ translate(
									'The service costs %(displayCost)s, plus one year of the %(planTitle)s hosting plan. If you choose to use an existing site that already has the plan, you will only be charged for the website design service.',
									{
										args: {
											displayCost,
											planTitle,
										},
									}
								) }
							</p>
						</FoldableFAQ>
						<FoldableFAQ id="faq-5" question={ translate( 'What does the service include?' ) }>
							<ul>
								<li>
									{ translate(
										'Custom page layouts for up to 5 pages, using the content you provide during sign up.'
									) }
								</li>
								<li>
									{ translate(
										'Theme selection (when the “Let us choose” option is selected during sign up).'
									) }
								</li>
								<li>{ translate( 'Color palette creation, based on your branding.' ) }</li>
								<li>
									{ translate(
										'Your logo (provided by you) added to the site, and creation of a site icon.'
									) }
								</li>
								<li>{ translate( 'Creation of a main navigation menu.' ) }</li>
								<li>{ translate( 'Creation of a social profiles menu.' ) }</li>
								<li>{ translate( 'Creation of a contact form.' ) }</li>
								<li>{ translate( 'Addition of custom CSS (when needed).' ) }</li>
								<li>
									{ translate( 'Sourcing of additional professional images (when needed).' ) }
								</li>
							</ul>
						</FoldableFAQ>
						<FoldableFAQ
							id="faq-6"
							question={ translate( 'What will my finished site look like?' ) }
						>
							<p>
								{ translate(
									'Your finished site will be built using a WordPress.com theme. The layout of your site will be a mobile-friendly responsive design and the content will adjust to look great on every device. The professional website builder will create the layout of each page based on the content you provide during the signup process. Additional high-quality professional images may be sourced from Pexels, a vast open source library of stock photos, to make sure each page stands out. Custom CSS may be added for further design tweaks.'
								) }
							</p>
						</FoldableFAQ>
						<FoldableFAQ
							id="faq-7"
							question={ translate( 'What if I want changes to the finished site?' ) }
						>
							<p>
								{ translate(
									'Although revisions aren’t included with this service, you will be able to edit all content of the site using the WordPress editor. You will be able to change images, edit text, and also add additional pages and posts. You could even try a new theme for a different look, and you will still have the professionally designed page layouts. Your %(planTitle)s plan comes with access to live chat and priority email support, so you can always contact support if you need help customizing your new site or have questions about this service.',
									{
										args: {
											planTitle,
										},
									}
								) }
							</p>
						</FoldableFAQ>
					</>
				) }
			</FAQSection>
		</>
	);
}
