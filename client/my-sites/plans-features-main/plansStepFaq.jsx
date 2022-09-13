import styled from '@emotion/styled';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import ExternalLinkWithTracking from 'calypso/components/external-link/with-tracking';
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

const PlanFAQ = ( { titanMonthlyRenewalCost } ) => {
	const dispatch = useDispatch();
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
			<FAQHeader className="wp-brand-font">{ 'Frequently Asked Questions' }</FAQHeader>
			<FoldableFAQ
				id="faq-1"
				question={ 'Is hosting included?' }
				expanded={ true }
				onToggle={ onFaqToggle }
			>
				Yes! All our plans include fast and reliable hosting that’s optimized for creating and
				scaling a WordPress site.
			</FoldableFAQ>
			<FoldableFAQ
				id="faq-2"
				question={ 'Can I import content from another service?' }
				onToggle={ onFaqToggle }
			>
				It is possible to import your blog content from a variety of other blogging platforms,
				including Blogger, GoDaddy, Wix, Squarespace, and more. You can also easily import your
				content from a self-hosted WordPress site.
			</FoldableFAQ>
			<FoldableFAQ
				id="faq-3"
				question={ 'Are traffic and bandwidth really unlimited?' }
				onToggle={ onFaqToggle }
			>
				Absolutely, and you will never be hit with any surprise usage fees. With WordPress.com,
				you’ll be hosted on our infinitely scalable and globally distributed server infrastructure,
				which means your site will always be available and load fast, no matter how popular your
				site becomes.
			</FoldableFAQ>
			<FoldableFAQ
				id="faq-4"
				question={ 'Can I use a domain I already own?' }
				onToggle={ onFaqToggle }
			>
				Yes! You can connect your domain for free to any WordPress.com paid plan (we won’t charge
				you a separate domain registration fee). You may either keep the domain at your current
				registrar or transfer it to us, whichever you prefer.
			</FoldableFAQ>
			<FoldableFAQ id="faq-5" question={ 'Can I host multiple sites?' } onToggle={ onFaqToggle }>
				Yes, you can host as many sites as you like, but they each need a separate plan. You can
				choose the appropriate plan for each site individually so you’ll pay for only the features
				you need. <br />
				We have a dashboard that helps you manage all your WordPress.com and Jetpack-connected
				websites, all from one simple and centralized admin tool.
			</FoldableFAQ>
			<FoldableFAQ id="faq-6" question={ 'What is your refund policy?' } onToggle={ onFaqToggle }>
				If you aren't satisfied with our product, you can cancel anytime within the refund period
				for a prompt and courteous refund, no questions asked. The refund timeframes are:{ ' ' }
				<ul>
					<li>14 days for annual WordPress.com plans</li>
					<li>7 days for monthly WordPress.com plans</li>
					<li>96 hours for new domain registrations</li>
				</ul>
			</FoldableFAQ>
			<FoldableFAQ
				id="faq-7"
				question={ 'I want to transfer an existing site, will purchasing a plan now break it?' }
				onToggle={ onFaqToggle }
			>
				No it won’t! You’re welcome to create your new site with us before pointing the domain here.
				That way your current site can stay “live” until your new one is ready.
				<br />
				We recommend getting a plan now because they have other features you might find useful,
				including direct live chat and email support. Just avoid using the domain options until
				you’re ready, and then you can connect or transfer the domain.
			</FoldableFAQ>
			<FoldableFAQ id="faq-8" question={ 'Can I get an email account?' } onToggle={ onFaqToggle }>
				Absolutely! We offer a few different options to meet your needs. For most customers, our
				Professional Email service is the smart choice. This robust hosted email solution is
				available for any domain hosted with WordPress.com and starts at just{ ' ' }
				{ titanMonthlyRenewalCost }/mo per mailbox.
				<br />
				We also offer a Google Workspace integration, and for users who need something simpler, you
				can set up email forwarding for free.
			</FoldableFAQ>
			<FoldableFAQ id="faq-9" question={ 'Can I install plugins?' } onToggle={ onFaqToggle }>
				Yes! When you subscribe to the WordPress.com Business or eCommerce plans, you’ll be able to
				search for and install over 50,000 available plugins in the WordPress repository.
			</FoldableFAQ>
			<FoldableFAQ id="faq-10" question={ 'Can I install my own theme?' } onToggle={ onFaqToggle }>
				Yes! All plans give you access to our directory of free and premium themes that have been
				handpicked and reviewed for quality by our team. With the WordPress.com Business or
				eCommerce plan, you can upload and install any theme you'd like.
			</FoldableFAQ>
			<FoldableFAQ id="faq-11" question={ 'Can you build a site for me?' } onToggle={ onFaqToggle }>
				We sure can! If you need a hand launching your website, take a look at Built By
				WordPress.com Express, our white glove site setup service. Our in-house experts will create
				your site, and you’ll be ready to go live in four business days or less. To learn more,{ ' ' }
				<ExternalLinkWithTracking
					icon={ true }
					href="https://wordpress.com/do-it-for-me/"
					tracksEventName="calypso_signup_step_plans_faq_difm_lp"
				>
					click here
				</ExternalLinkWithTracking>
				.
			</FoldableFAQ>
			<FoldableFAQ id="faq-12" question={ 'Can I talk to a live person?' } onToggle={ onFaqToggle }>
				We’d love to chat with you! All paid plans include access to one-on-one support from our
				team of WordPress experts (we call them Happiness Engineers). The Personal plan includes
				email support while the Premium plan and above all include live chat support.
				<br />
				If you have pre-purchase questions, we offer live chat on the checkout page. Select the plan
				that looks like the best fit for you and click the “Questions? Ask a Happiness Engineer”
				link on the next page.
			</FoldableFAQ>
		</div>
	);
};

export default PlanFAQ;
