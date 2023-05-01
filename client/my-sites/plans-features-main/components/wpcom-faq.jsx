import { isEnabled } from '@automattic/calypso-config';
import { localizeUrl } from '@automattic/i18n-utils';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import FAQ from 'calypso/components/faq';
import FAQItem from 'calypso/components/faq/faq-item';
import HappychatButton from 'calypso/components/happychat/button';
import { purchasesRoot } from 'calypso/me/purchases/paths';
import isHappychatAvailable from 'calypso/state/happychat/selectors/is-happychat-available';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';

const WpcomFAQ = ( { isChatAvailable, siteSlug, translate } ) => {
	const helpLink =
		isEnabled( 'happychat' ) && isChatAvailable ? (
			<HappychatButton className="plans-features-main__happychat-button" />
		) : (
			<a href="https://wordpress.com/help" target="_blank" rel="noopener noreferrer" />
		);

	const themesAnswer = isEnabled( 'themes/premium' )
		? translate(
				"Yes! With the WordPress.com Business or eCommerce plan you can install any theme you'd like." +
					' All plans give you access to our {{a}}directory of free and premium themes{{/a}}.' +
					' These are among the highest-quality WordPress themes, hand-picked and reviewed by our team.',
				{
					components: { a: <a href={ `/themes/${ siteSlug }` } /> },
				}
		  )
		: translate(
				"Yes! With the WordPress.com Business or eCommerce plan you can install any theme you'd like." +
					' All plans give you access to our {{a}}directory of free themes{{/a}}.' +
					' These are among the highest-quality WordPress themes, hand-picked and reviewed by our team.',
				{
					components: { a: <a href={ `/themes/${ siteSlug }` } /> },
				}
		  );

	return (
		<FAQ>
			<FAQItem
				question={ translate( 'Do you sell domains?' ) }
				answer={ translate(
					'Yes! Annual and biannual Personal, Premium, Business, and eCommerce plans include a free custom domain for one year. ' +
						'That includes new domains purchased through WordPress.com or your own existing domain that you can map' +
						' to your WordPress.com site. Does not apply to premium domains. Domain name should be' +
						' registered within one year of the purchase of the plan to use this promotion. Registered' +
						' domain names will renew at regular prices. {{a}}Find out more about domains.{{/a}}',
					{
						components: {
							a: (
								<a
									href={ localizeUrl( 'https://wordpress.com/support/all-about-domains/' ) }
									target="_blank"
									rel="noopener noreferrer"
								/>
							),
						},
					}
				) }
			/>

			<FAQItem
				question={ translate( 'Can I install plugins?' ) }
				answer={ translate(
					'Yes! With the WordPress.com Business or eCommerce plan you can search for and install external plugins.' +
						' All plans already come with a custom set of plugins tailored just for them.' +
						' {{a}}Find out more about plugins{{/a}}.',
					{
						components: {
							a: (
								<a
									href={ localizeUrl( 'https://wordpress.com/support/plugins/' ) }
									target="_blank"
									rel="noopener noreferrer"
								/>
							),
						},
					}
				) }
			/>

			<FAQItem question={ translate( 'Can I install my own theme?' ) } answer={ themesAnswer } />

			<FAQItem
				question={ translate( 'Do I need another web host?' ) }
				answer={ translate(
					'No. All WordPress.com sites include our specially tailored WordPress hosting to ensure' +
						' your site stays available and secure at all times. You can even use your own domain' +
						' when you upgrade to the Personal, Premium, Business, or eCommerce plan.'
				) }
			/>

			<FAQItem
				question={ translate( 'Do you offer email accounts?' ) }
				answer={ translate(
					'Yes. We offer Professional Email which is a robust hosted email solution for any custom domain ' +
						'registered through WordPress.com. You can also set up free email forwarding, or use our Google ' +
						'Workspace integration to power your emails. {{a}}Learn more about our email solutions{{/a}}.',
					{
						components: {
							a: (
								<a
									href={ localizeUrl( 'https://wordpress.com/support/add-email/' ) }
									target="_blank"
									rel="noopener noreferrer"
								/>
							),
						},
					}
				) }
			/>

			<FAQItem
				question={ translate( 'What’s included with advanced custom design?' ) }
				answer={ translate(
					'Custom design is a toolset you can use to personalize your blog’s look and feel with' +
						' custom colors & backgrounds, custom fonts, and even a CSS editor that you can use for' +
						' more precise control of your site’s' +
						' design. {{a}}Find out more about custom design{{/a}}.',
					{
						components: {
							a: (
								<a
									href={ localizeUrl( 'https://wordpress.com/support/custom-design/' ) }
									target="_blank"
									rel="noopener noreferrer"
								/>
							),
						},
					}
				) }
			/>

			<FAQItem
				question={ translate( 'Will upgrading affect my content?' ) }
				answer={ translate(
					'Plans add extra features to your site, but they do not affect the content of your site' +
						" or your site's followers."
				) }
			/>

			<FAQItem
				question={ translate( 'Can I cancel my subscription?' ) }
				answer={ translate(
					'Yes. We want you to love everything you do at WordPress.com, so we provide a %(annualDays)d-day refund on all of our annual plans and a %(monthlyDays)d-day refund on all of our monthly plans. {{a}}Manage purchases{{/a}}.',
					{
						args: { annualDays: 14, monthlyDays: 7 },
						components: { a: <a href={ purchasesRoot } /> },
					}
				) }
			/>

			<FAQItem
				question={ translate( 'Have more questions?' ) }
				answer={ translate(
					'Need help deciding which plan works for you? Our happiness engineers are available for' +
						' any questions you may have. {{helpLink}}Get help{{/helpLink}}.',
					{
						components: { helpLink },
					}
				) }
			/>
		</FAQ>
	);
};

export default connect( ( state ) => ( {
	isChatAvailable: isHappychatAvailable( state ),
	siteSlug: getSelectedSiteSlug( state ),
} ) )( localize( WpcomFAQ ) );
