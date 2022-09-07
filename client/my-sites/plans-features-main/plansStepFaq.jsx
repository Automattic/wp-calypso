import styled from '@emotion/styled';
import FoldableFAQComponent from 'calypso/components/foldable-faq';

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

export default function PlanFAQ() {
	return (
		<div className="plan-faq">
			<FAQHeader className="wp-brand-font">{ 'Frequently Asked Questions' }</FAQHeader>
			<FoldableFAQ
				id="faq-1"
				question={ 'What domains are available? Can I use one I already own?' }
				expanded={ true }
			>
				On WordPress.com, you can register new domains and can choose from more than 300 different
				extensions such as .com, .org, .services etc. Domains registered elsewhere can be used on
				WordPress.com using Domain Mapping or transferred to us to manage everything in one place.
				The annual and biannual plans come included with a free domain for one year.
			</FoldableFAQ>
			<FoldableFAQ id="faq-2" question={ 'Can I import content from another service?' }>
				It is possible to import your blog content from a variety of other blogging platforms,
				including Blogger, GoDaddy, Wix, Medium, Squarespace, Movable Type, Typepad, Xanga, and
				more. You can also easily import your content from a self-hosted WordPress site.
			</FoldableFAQ>
			<FoldableFAQ id="faq-3" question={ 'What is your refund policy?' }>
				If you aren't satisfied with our product, you can cancel anytime within the refund period
				for a prompt and courteous refund, no questions asked. The refund timeframes are:{ ' ' }
				<ul>
					<li>14-days for annual WordPress.com plans</li>
					<li>7-days for monthly WordPress.com plans</li>
					<li>96 hours for new domain registrations</li>
				</ul>
			</FoldableFAQ>
			<FoldableFAQ id="faq-4" question={ 'Can I get an email account?' }>
				Yes. We offer Professional Email which is a robust hosted email solution for any custom
				domain registered through WordPress.com. You can also set up free email forwarding, or use
				our Google Workspace integration to power your emails.{ ' ' }
			</FoldableFAQ>
			<FoldableFAQ id="faq-5" question={ 'Is hosting included?' }>
				All WordPress.com plans, including the free plan, come with fast, secure, and reliable
				hosting.
			</FoldableFAQ>
			<FoldableFAQ id="faq-6" question={ 'How do I pay for my plan?' }>
				You can pay for your brand new WordPress.com plan, add-ons, and domains using any major
				credit card, debit card, or PayPal. In addition to these, we also support many local payment
				methods in select countries.
			</FoldableFAQ>
			<FoldableFAQ id="faq-7" question={ 'Is monthly billing available for plans?' }>
				Yes! Click on the "Pay monthly" tab above or select the monthly option during checkout to
				pay for your plan in monthly billing cycles.
			</FoldableFAQ>
			<FoldableFAQ id="faq-8" question={ 'Can I create a blog in another language?' }>
				Absolutely. You can change your blog language, which is how your readers will experience
				your site and the Interface Language, which changes the admin tools language. The language
				you use on your blog is up to you!
			</FoldableFAQ>
			<FoldableFAQ id="faq-8" question={ 'Can I make money with my website?' }>
				Yes! You can sell individual items on your blog or create memberships to share select
				content with your subscribers. You can also publish sponsored posts or use affiliate links
				in your content, and apply to join WordAds, our advertising program.
			</FoldableFAQ>
		</div>
	);
}
