/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import FAQ from 'components/faq';
import FAQItem from 'components/faq/faq-item';

export default React.createClass( {
	displayName: 'FAQ',

	render() {
		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/design/faq">FAQ</a>
				</h2>
				<FAQ>
					<FAQItem
						question="Have more questions?"
						answer="Need help deciding which plan works for you? Our happiness engineers are available for any questions you may have."
					/>
					<FAQItem
						question="Can I cancel my subscription?"
						answer={ [
							'Yes. We want you to love everything you do at WordPress.com, so we provide a 30-day refund on all of our plans. ',
							<a href="#" key="manage-purchases">Manage purchases</a>
						] }
					/>
					<FAQItem
						question="Do you offer email accounts?"
						answer="Yes. If you register a new domain with our premium or business plans, you can optionally add Google apps for work. You can also set up email forwarding for any custom domain registered through WordPress.com."
					/>
					<FAQItem
						question="Another FAQ item?"
						answer="Yes. We need to see how more FAQItems align to each other, that's why."
					/>
					<FAQItem
						question="Wait, but why?"
						answer="I already told you so. But just to be sure long texts work, let's write a long text as an answer here. Still not finished. I'm writing. Okay, this should be enough. Just. One. More. Whole sentence. Maybe a bit more. This is it."
					/>
					<FAQItem
						question="Have more questions?"
						answer="Need help deciding which plan works for you? Our happiness engineers are available for any questions you may have."
					/>
					<FAQItem
						question="Can I cancel my subscription?"
						answer={ [
							'Yes. We want you to love everything you do at WordPress.com, so we provide a 30-day refund on all of our plans. ',
							<a href="#" key="manage-purchases-two">Manage purchases</a>
						] }
					/>
					<FAQItem
						question="Do you offer email accounts?"
						answer="Yes. If you register a new domain with our premium or business plans, you can optionally add Google apps for work. You can also set up email forwarding for any custom domain registered through WordPress.com."
					/>
				</FAQ>
			</div>
		);
	}
} );

