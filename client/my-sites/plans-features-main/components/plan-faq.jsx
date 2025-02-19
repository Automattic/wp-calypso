import {
	PLAN_PERSONAL,
	PLAN_PREMIUM,
	PLAN_BUSINESS,
	PLAN_ECOMMERCE,
	getPlan,
} from '@automattic/calypso-products';
import { ExternalLink } from '@automattic/components';
import { localizeUrl, useHasEnTranslation } from '@automattic/i18n-utils';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import ExternalLinkWithTracking from 'calypso/components/external-link-with-tracking';
import FoldableFAQComponent from 'calypso/components/foldable-faq';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

const FAQHeader = styled.h1`
	font-size: 2rem;
	text-align: center;
	margin: 48px 0;
`;

const FoldableFAQ = styled( FoldableFAQComponent )`
	.foldable-faq__question-text {
		font-size: 1.125rem;
	}
`;

const PlanFAQ = ( { titanMonthlyRenewalCost = 0 } ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const hasEnTranslation = useHasEnTranslation();
	const onFaqToggle = useCallback(
		( faqArgs ) => {
			const { id, isExpanded } = faqArgs;
			const tracksArgs = {
				faq_id: id,
			};

			if ( isExpanded ) {
				// FAQ opened
				dispatch( recordTracksEvent( 'calypso_plans_faq_open', tracksArgs ) );
			} else {
				// FAQ closed
				dispatch( recordTracksEvent( 'calypso_plans_faq_closed', tracksArgs ) );
			}
		},
		[ dispatch ]
	);

	return (
		<div className="plan-faq">
			<FAQHeader className="wp-brand-font">{ translate( 'Frequently Asked Questions' ) }</FAQHeader>
			<FoldableFAQ
				id="faq-1"
				question={ translate( 'Is hosting included?' ) }
				expanded
				onToggle={ onFaqToggle }
			>
				{ translate(
					'Yes! All our plans include fast and reliable hosting that’s optimized for creating and scaling a WordPress site.'
				) }
			</FoldableFAQ>
			<FoldableFAQ
				id="faq-2"
				question={ translate( 'Can I import content from another service?' ) }
				onToggle={ onFaqToggle }
			>
				<>
					{ translate(
						'It is possible to import your blog content from a variety of other blogging platforms, including Blogger, ' +
							'GoDaddy, Wix, Squarespace, and more. You can also easily import your content from a self-hosted WordPress site.'
					) }
					{ hasEnTranslation(
						'Want a Happiness Engineer to do a free migration of your WordPress site to WordPress.com? ' +
							'{{ExternalLink}}Request a Happiness Engineer{{/ExternalLink}} to handle your migration for free!'
					)
						? translate(
								'{{br /}}{{br /}}Want a Happiness Engineer to do a free migration of your WordPress site to WordPress.com? ' +
									'{{ExternalLink}}Request a Happiness Engineer{{/ExternalLink}} to handle your migration for free!',
								{
									components: {
										br: <br />,
										ExternalLink: (
											<ExternalLink
												href={ localizeUrl(
													'https://wordpress.com/support/request-a-free-migration/'
												) }
											/>
										),
									},
								}
						  )
						: null }
				</>
			</FoldableFAQ>
			<FoldableFAQ
				id="faq-3"
				question={ translate( 'Are traffic and bandwidth really unlimited?' ) }
				onToggle={ onFaqToggle }
			>
				{ translate(
					'Absolutely, and you will never be hit with any surprise usage fees. With WordPress.com, ' +
						'you’ll be hosted on our infinitely scalable and globally distributed server infrastructure, ' +
						'which means your site will always be available and load fast, no matter how popular your site becomes.'
				) }
			</FoldableFAQ>
			<FoldableFAQ
				id="faq-4"
				question={ translate( 'Can I use a domain I already own?' ) }
				onToggle={ onFaqToggle }
			>
				{ translate(
					'Yes! You can connect your domain for free to any WordPress.com paid plan (we won’t charge ' +
						'you a separate domain registration fee). You may either keep the domain at your current ' +
						'registrar or transfer it to us, whichever you prefer.'
				) }
			</FoldableFAQ>
			<FoldableFAQ
				id="faq-5"
				question={ translate( 'Can I host multiple sites?' ) }
				onToggle={ onFaqToggle }
			>
				{ translate(
					'Yes, you can host as many sites as you like, but they each need a separate plan. You can ' +
						'choose the appropriate plan for each site individually so you’ll pay for only the features ' +
						'you need.{{br /}}{{br /}}We have a dashboard that helps you manage all your WordPress.com and Jetpack-connected ' +
						'websites, all from one simple and centralized admin tool.',
					{
						components: { br: <br /> },
					}
				) }
			</FoldableFAQ>
			<FoldableFAQ
				id="faq-6"
				question={ translate( 'What is your refund policy?' ) }
				onToggle={ onFaqToggle }
			>
				{ translate(
					"If you aren't satisfied with our product, you can cancel anytime within the refund period " +
						'for a prompt and courteous refund, no questions asked. The refund timeframes are:{{br /}}' +
						'{{ul}}' +
						'{{li}}14 days for annual WordPress.com plans{{/li}}' +
						'{{li}}7 days for monthly WordPress.com plans{{/li}}' +
						'{{li}}96 hours for new domain registrations{{/li}}' +
						'{{/ul}}',
					{
						components: { br: <br />, ul: <ul />, li: <li /> },
					}
				) }
			</FoldableFAQ>
			<FoldableFAQ
				id="faq-7"
				question={ translate(
					'I want to transfer an existing site, will purchasing a plan now break it?'
				) }
				onToggle={ onFaqToggle }
			>
				{ hasEnTranslation(
					'No it won’t! You’re welcome to create your new site with us before pointing the domain here. ' +
						'That way your current site can stay “live” until your new one is ready.{{br /}}{{br /}}' +
						'We recommend getting a plan now because they have other features you might find useful, ' +
						'including expert support from our team. Just avoid using the domain options until ' +
						'you’re ready, and then you can connect or transfer the domain.{{br /}}{{br /}}' +
						'Our Happiness Engineers can also do the migration for you. {{ExternalLink}}Request a Happiness Engineer{{/ExternalLink}} to migrate your site for free!'
				)
					? translate(
							'No it won’t! You’re welcome to create your new site with us before pointing the domain here. ' +
								'That way your current site can stay “live” until your new one is ready.{{br /}}{{br /}}' +
								'We recommend getting a plan now because they have other features you might find useful, ' +
								'including expert support from our team. Just avoid using the domain options until ' +
								'you’re ready, and then you can connect or transfer the domain.{{br /}}{{br /}}' +
								'Our Happiness Engineers can also do the migration for you. {{ExternalLink}}Request a Happiness Engineer{{/ExternalLink}} to migrate your site for free!',
							{
								components: {
									br: <br />,
									ExternalLink: (
										<ExternalLink
											href={ localizeUrl(
												'https://wordpress.com/support/request-a-free-migration/'
											) }
										/>
									),
								},
							}
					  )
					: translate(
							'No it won’t! You’re welcome to create your new site with us before pointing the domain here. ' +
								'That way your current site can stay “live” until your new one is ready.{{br /}}{{br /}}' +
								'We recommend getting a plan now because they have other features you might find useful, ' +
								'including direct live chat and email support. Just avoid using the domain options until ' +
								'you’re ready, and then you can connect or transfer the domain.',
							{
								components: { br: <br /> },
							}
					  ) }
			</FoldableFAQ>
			<FoldableFAQ
				id="faq-8"
				question={ translate( 'Can I get an email account?' ) }
				onToggle={ onFaqToggle }
			>
				{ titanMonthlyRenewalCost
					? translate(
							'Absolutely! We offer a few different options to meet your needs. For most customers, our ' +
								'Professional Email service is the smart choice. This robust hosted email solution is ' +
								'available for any domain hosted with WordPress.com and starts at just %(titanMonthlyRenewalCost)s/mo per mailbox.{{br /}}{{br /}}' +
								'We also offer a Google Workspace integration, and for users who need something simpler, you ' +
								'can set up email forwarding for free.',
							{
								components: { br: <br /> },
								args: { titanMonthlyRenewalCost },
							}
					  )
					: translate(
							'Absolutely! We offer a few different options to meet your needs. For most customers, our ' +
								'Professional Email service is the smart choice. This robust hosted email solution is ' +
								'available for any domain hosted with WordPress.com.{{br /}}{{br /}}' +
								'We also offer a Google Workspace integration, and for users who need something simpler, you ' +
								'can set up email forwarding for free.',
							{
								components: { br: <br /> },
							}
					  ) }
			</FoldableFAQ>
			<FoldableFAQ
				id="faq-9"
				question={ translate( 'Can I install plugins?' ) }
				onToggle={ onFaqToggle }
			>
				{ translate(
					'Yes! When you subscribe to the WordPress.com %(businessPlanName)s or %(ecommercePlanName)s plans, you’ll be able to ' +
						'search for and install over 50,000 available plugins in the WordPress repository.',
					{
						args: {
							businessPlanName: getPlan( PLAN_BUSINESS ).getTitle(),
							ecommercePlanName: getPlan( PLAN_ECOMMERCE ).getTitle(),
						},
					}
				) }
			</FoldableFAQ>
			<FoldableFAQ
				id="faq-10"
				question={ translate( 'Can I install my own theme?' ) }
				onToggle={ onFaqToggle }
			>
				{ translate(
					'Yes! All plans give you access to our directory of free and premium themes that have been ' +
						'handpicked and reviewed for quality by our team. With the WordPress.com %(businessPlanName)s or ' +
						"%(ecommercePlanName)s plan, you can upload and install any theme you'd like.",
					{
						args: {
							businessPlanName: getPlan( PLAN_BUSINESS ).getTitle(),
							ecommercePlanName: getPlan( PLAN_ECOMMERCE ).getTitle(),
						},
					}
				) }
			</FoldableFAQ>
			<FoldableFAQ
				id="faq-11"
				question={ translate( 'Can you build a site for me?' ) }
				onToggle={ onFaqToggle }
			>
				{ translate(
					'We sure can! If you need a hand launching your website, take a look at our express site setup service. ' +
						'Our in-house experts will create your site, and you’ll be ready to go live in four business days or less. ' +
						'To learn more, {{ExternalLinkWithTracking}}click here{{/ExternalLinkWithTracking}}.',
					{
						components: {
							ExternalLinkWithTracking: (
								<ExternalLinkWithTracking
									icon
									href="https://wordpress.com/website-design-service/"
									tracksEventName="calypso_signup_step_plans_faq_difm_lp"
								/>
							),
						},
					}
				) }
			</FoldableFAQ>
			<FoldableFAQ
				id="faq-12"
				question={ translate( 'Can I talk to a live person?' ) }
				onToggle={ onFaqToggle }
			>
				{ hasEnTranslation(
					'We’d love to talk with you! All paid plans include access to support from our ' +
						'team of WordPress experts (we call them Happiness Engineers).{{br /}}{{br /}}' +
						'And if you have pre-purchase questions, we can talk at the checkout page. Select the plan ' +
						'that looks like the best fit for you and click the “Questions? Ask a Happiness Engineer” ' +
						'link on the next page.'
				)
					? translate(
							'We’d love to talk with you! All paid plans include access to support from our ' +
								'team of WordPress experts (we call them Happiness Engineers).{{br /}}{{br /}}' +
								'And if you have pre-purchase questions, we can talk at the checkout page. Select the plan ' +
								'that looks like the best fit for you and click the “Questions? Ask a Happiness Engineer” ' +
								'link on the next page.',
							{
								components: { br: <br /> },
							}
					  )
					: translate(
							'We’d love to chat with you! All paid plans include access to one-on-one support from our ' +
								'team of WordPress experts (we call them Happiness Engineers). The %(personalPlanName)s plan includes ' +
								'email support while the %(premiumPlanName)s plan and above all include live chat support.{{br /}}{{br /}}' +
								'If you have pre-purchase questions, we offer live chat on the checkout page. Select the plan ' +
								'that looks like the best fit for you and click the “Questions? Ask a Happiness Engineer” ' +
								'link on the next page.',
							{
								args: {
									personalPlanName: getPlan( PLAN_PERSONAL ).getTitle(),
									premiumPlanName: getPlan( PLAN_PREMIUM ).getTitle(),
								},
								components: { br: <br /> },
							}
					  ) }
			</FoldableFAQ>
		</div>
	);
};

export default PlanFAQ;
