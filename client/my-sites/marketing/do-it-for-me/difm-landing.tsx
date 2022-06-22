import { isEnabled } from '@automattic/calypso-config';
import {
	WPCOM_DIFM_LITE,
	getPlan,
	PLAN_WPCOM_PRO,
	PLAN_PREMIUM,
} from '@automattic/calypso-products';
import { Gridicon } from '@automattic/components';
import styled from '@emotion/styled';
import { Card, Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import QueryProductsList from 'calypso/components/data/query-products-list';
import FoldableFAQComponent from 'calypso/components/foldable-faq';
import FormattedHeader from 'calypso/components/formatted-header';
import {
	getProductDisplayCost,
	isProductsListFetching,
} from 'calypso/state/products-list/selectors';

import './difm-landing.scss';

const Placeholder = () => <span className="difm-landing__price-placeholder">&nbsp;</span>;

type StyledHeadingProps = {
	fontSize: string;
};

const StyledHeading = styled.h1< StyledHeadingProps >`
	font-size: ${ ( props ) => props.fontSize || '2.25rem' };
	text-align: center;
`;

const StepsSection = styled.div`
	display: flex;
	align-items: center;
	gap: 1rem;
	div {
		flex: 1;
	}
	margin: 3rem 0;
	@media ( max-width: 660px ) {
		flex-direction: column;
	}
`;

const FAQSection = styled.div`
	margin: 3rem 0;
	.foldable-faq__question-text {
		font-size: 1.125rem;
	}
`;

const FoldableFAQ = styled( FoldableFAQComponent )`
	&.is-expanded .foldable-faq__answer {
		padding-bottom: 0;
	}
`;

const TestimonialsSection = styled.div`
	display: flex;
	margin: 3rem 0;
	gap: 1rem;
	@media ( max-width: 660px ) {
		flex-direction: column;
	}
`;

const TestimonialWrapper = styled.div`
	display: flex;
`;

const TestimonialAuthor = styled.div`
	color: var( --studio-gray-60 );
	margin-top: 1rem;
`;

const Testimonial = ( { quote, author }: { quote: string; author: string } ) => (
	<TestimonialWrapper>
		<div>
			<Gridicon icon="quote" size={ 48 } color={ 'var(--studio-gray-60)' } />
		</div>
		<div>
			<div>{ quote }</div>
			<TestimonialAuthor>- { author }</TestimonialAuthor>
		</div>
	</TestimonialWrapper>
);

const HeaderCard = styled( Card )`
	margin-top: 3rem;
	padding: 3rem 5rem;
	@media ( max-width: 660px ) {
		padding: 2rem;
	}
`;

const CTASectionWrapper = styled.div`
	text-align: center;
	margin: 2rem 0;
`;

const CTAButton = styled( Button )`
	border: 1px solid var( --color-accent );
	font-size: 14px;
	height: unset;
	line-height: 22px;
	padding: 8px 14px;
`;

const LinkButton = styled( Button )`
	font-size: 16px;
`;

export default function DIFMLanding( { onSubmit }: { onSubmit: () => void } ) {
	const translate = useTranslate();
	const displayCost = useSelector( ( state ) => getProductDisplayCost( state, WPCOM_DIFM_LITE ) );
	const isLoading = useSelector( isProductsListFetching );

	const planTitle = isEnabled( 'plans/pro-plan' )
		? getPlan( PLAN_WPCOM_PRO )?.getTitle()
		: getPlan( PLAN_PREMIUM )?.getTitle();

	const CTASection = () => (
		<CTASectionWrapper>
			<CTAButton onClick={ onSubmit } isPrimary={ true }>
				{ translate( 'Hire a Professional' ) }
			</CTAButton>
		</CTASectionWrapper>
	);
	return (
		<div>
			{ ! displayCost && <QueryProductsList persist /> }
			<FormattedHeader
				align={ 'center' }
				headerText={ isLoading ? <Placeholder /> : displayCost }
				subHeaderText={ translate(
					'One time fee, plus a one year subscription of the %(plan)s plan.',
					{
						args: {
							plan: planTitle,
						},
					}
				) }
			/>
			<HeaderCard>
				<p>
					{ translate(
						'Do It For Me: Website Design Service is an excellent choice for anyone who prefers to have a professional set up their website. A WordPress.com professional builder will create custom layouts for up to %(pages)d pages of the site using your provided content. You’ll receive your new website within %(fulfillmentDays)d business days.',
						{
							args: {
								fulfillmentDays: 4,
								pages: 5,
							},
						}
					) }
				</p>
				<CTASection />
				{ /* eslint-disable-next-line wpcalypso/jsx-classname-namespace */ }
				<StyledHeading className="wp-brand-font" fontSize={ '2.25rem' }>
					{ translate( 'It only takes 4 simple steps.' ) }
				</StyledHeading>
				<StepsSection>
					<div>
						<img
							alt="website examples"
							src="https://assets.a8c.vercel.app/static/difm-lite/hero-lockup.png"
						></img>
					</div>
					<div>
						<ol>
							<li>{ translate( 'Submit your business information.' ) }</li>
							<li>{ translate( 'Select your design and pages.' ) }</li>
							<li>{ translate( 'Complete the purchase.' ) }</li>
							<li>{ translate( 'Submit the content for your new website.' ) }</li>
						</ol>
					</div>
				</StepsSection>
				<StyledHeading fontSize={ '1.5rem' }>
					{ translate( 'Receive your finished website in 4 business days or less!' ) }
				</StyledHeading>
			</HeaderCard>
			<TestimonialsSection>
				{ /* Testimonial text will remain untranslated */ }
				<Testimonial
					quote={ 'I’m really happy with this. THANK YOU! It’s exactly what I wanted.' }
					author={ 'Jane K.' }
				/>
				<Testimonial
					quote={
						'I love my new website. Y’all did a great job in a short time and I am so grateful.'
					}
					author={ 'Karyn G.' }
				/>
				<Testimonial
					quote={ 'Thank you so much the site WordPress.com made came out great!' }
					author={ 'Angelo C.' }
				/>
			</TestimonialsSection>
			<FAQSection>
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
						<li>{ translate( 'Receive your finished website in 4 business days or less!' ) }</li>
					</ul>
					<CTASection />
				</FoldableFAQ>
				<FoldableFAQ id="faq-3" question={ translate( 'Who is this service for?' ) }>
					<ul>
						<li>{ translate( 'Small business owners looking to get online quickly.' ) }</li>
						<li>{ translate( 'Bloggers wanting some help with their initial site setup.' ) }</li>
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
						<li>{ translate( 'Sourcing of additional professional images (when needed).' ) }</li>
					</ul>
				</FoldableFAQ>
				<FoldableFAQ id="faq-6" question={ translate( 'What will my finished site look like?' ) }>
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
			</FAQSection>
			<CTASection />
		</div>
	);
}
