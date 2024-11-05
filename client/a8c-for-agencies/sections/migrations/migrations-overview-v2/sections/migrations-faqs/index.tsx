import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import PageSection from 'calypso/a8c-for-agencies/components/page-section';
import { A4A_REFERRALS_PAYMENT_SETTINGS } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import FoldableFAQ from 'calypso/components/foldable-faq';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

import './style.scss';

export default function MigrationsFAQs() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const onFaqToggle = useCallback(
		( faqArgs: { id: string; buttonId: string; isExpanded: boolean; height: number } ) => {
			const { id, buttonId, isExpanded } = faqArgs;

			const removeHash = () => {
				history.replaceState( '', document.title, location.pathname + location.search );
			};

			// Add expanded FAQ buttonId to the URL hash
			const addHash = () => {
				history.replaceState(
					'',
					document.title,
					location.pathname + location.search + `#${ buttonId }`
				);
			};

			if ( isExpanded ) {
				addHash();
				dispatch(
					recordTracksEvent( 'calypso_a4a_migrations_faq_open', {
						faq_id: id,
					} )
				);
			} else {
				removeHash();
				dispatch(
					recordTracksEvent( 'calypso_a4a_migrations_closed', {
						faq_id: id,
					} )
				);
			}
		},
		[ dispatch ]
	);

	const faqs = [
		{
			id: 'site-downtime-expectations-during-transfer',
			question: translate( 'Can I expect any site downtime during the transfer?' ),
			answer: translate(
				'Sites are migrated by moving a copy onto our servers. During this process, the existing site remains live at your previous host. Once the migration is complete, the domain is pointed to the version of the site on our servers. There can be minimal interruption while the DNS propagates, but normally, your visitors will experience no downtime. For e-commerce sites, we coordinate with you on a migration window during which the site can be placed into maintenance mode. This prevents orders from being created across the two sites. This is optional but recommended and typically lasts just a couple of hours.'
			),
		},
		{
			id: 'migration-process-duration',
			question: translate( 'When will the migration process be done?' ),
			answer: translate(
				'When you request a migration, our team will coordinate with you on the timing. Generally, migrations happen within one working week of your request, but at busy times, they may take a little longer. For e-commerce sites, we coordinate with you to identify low-impact times when a site can be placed into maintenance mode during the migration.'
			),
		},
		{
			id: 'buyout-credit-calculation',
			question: translate( 'How do you calculate my buyout credit?' ),
			answer: translate(
				'We will ask you to provide a copy of your current contract or invoice to determine the remaining time on your plan. We will then credit you for the same amount of time left on the plan that you choose in Automattic for Agencies.'
			),
		},
		{
			id: 'multiple-sites-migration-offers',
			question: translate( 'Are there any special offers for agencies moving multiple sites?' ),
			answer: (
				<>
					{ translate(
						'From now until the end of 2024, you’ll receive $100 for each site you migrate to Pressable or WordPress.com, up to $10,000*. If you’re a WP Engine customer, we’ll also credit the costs to set you free.'
					) }
					<br />
					<br />
					{ translate(
						'* The migration limit is $10,000 for WP Engine and $3,000 for other hosts.'
					) }
				</>
			),
		},
		{
			id: 'migration-tasks-to-handle-on-my-own',
			question: translate( 'What tasks will I need to handle on my own during the migration?' ),
			answer: translate(
				'If you choose to have our migration team handle the actual migrations, you will need to initially set up a login on each site and share it with them (we provide step-by-step instructions and a secure method to share). Once the migration is completed, our team reviews the copy of the site on our servers and will ask you to do the same. You’ll then need to point the domain to our servers by changing the DNS records.'
			),
		},
		{
			id: 'migration-host-application',
			question: translate( 'Does this apply to any host?' ),
			answer: translate(
				'Yes. It doesn’t matter where your site is hosted; our migration offer extends to any site migrated to WordPress.com or Pressable.'
			),
		},
		{
			id: 'migration-existing-host-location',
			question: translate( 'Does my site already have to be hosted on WordPress?' ),
			answer: translate(
				'No. It doesn’t matter what CMS your site currently uses. You will be eligible for our migration offer if you migrate your site to WordPress.com or Pressable. However, we won’t be able to provide you with migration assistance in this case.'
			),
		},
		{
			id: 'migration-payment-process',
			question: translate( 'How do I get paid?' ),
			answer: translate(
				'Once your sites have been active on WordPress.com or Pressable hosting for over 6 months, we will pay you the site migration commission during the payout windows listed {{PayoutKBLink}}here{{/PayoutKBLink}}. You will also need to add your payment details to our payment partner, Tipalti, which you can do {{PaymentSettingLink}}here{{/PaymentSettingLink}}.',
				{
					components: {
						PayoutKBLink: (
							<a
								href="https://agencieshelp.automattic.com/knowledge-base/automattic-for-agencies-earnings/"
								target="_blank"
								rel="noreferrer"
								onClick={ () =>
									dispatch( recordTracksEvent( 'calypso_a4a_migrations_payout_kb_link_click' ) )
								}
							/>
						),
						PaymentSettingLink: (
							<a
								href={ A4A_REFERRALS_PAYMENT_SETTINGS }
								onClick={ () =>
									dispatch(
										recordTracksEvent( 'calypso_a4a_migrations_payment_setting_link_click' )
									)
								}
							/>
						),
					},
				}
			),
		},
	];

	return (
		<PageSection
			heading={ translate( 'Frequently asked questions' ) }
			description={ translate( 'Curious about the details? We’ve got answers.' ) }
		>
			<ul className="migrations-faqs">
				{ faqs.map( ( faq ) => (
					<li key={ faq.id }>
						<FoldableFAQ
							id={ faq.id }
							question={ faq.question }
							onToggle={ onFaqToggle }
							className="migrations-faqs__section"
						>
							{ faq.answer }
						</FoldableFAQ>
					</li>
				) ) }
			</ul>
		</PageSection>
	);
}
