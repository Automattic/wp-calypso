import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import FoldableFAQ from 'calypso/components/foldable-faq';
import {
	getAgenciesLink,
	getHelpLink,
	getSupportLink,
} from 'calypso/my-sites/plans-features-main/components/jetpack-faq';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import type { FC } from 'react';

import './style.scss';

const jetpackGettingStartedLink = () => {
	return (
		<a
			href="https://jetpack.com/support/getting-started-with-jetpack/"
			target="_blank"
			rel="noopener noreferrer"
			onClick={ () => {
				recordTracksEvent( 'calypso_jetpack_faq_getting_started_click' );
			} }
		/>
	);
};

const jetpackGDPRLink = () => {
	return (
		<a
			href={ localizeUrl( 'https://jetpack.com/gdpr/' ) }
			target="_blank"
			rel="noopener noreferrer"
			onClick={ () => {
				recordTracksEvent( 'calypso_jetpack_faq_gdpr_click' );
			} }
		/>
	);
};

const JetpackFAQ: FC = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const siteId = useSelector( getSelectedSiteId );

	const onFaqToggle = useCallback(
		( faqArgs: { id: string; buttonId: string; isExpanded: boolean; height: number } ) => {
			const { id, buttonId, isExpanded } = faqArgs;
			const tracksArgs = {
				site_id: siteId,
				faq_id: id,
			};

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
				// FAQ opened
				dispatch( recordTracksEvent( 'calypso_plans_faq_open', tracksArgs ) );
			} else {
				removeHash();
				// FAQ closed
				dispatch( recordTracksEvent( 'calypso_plans_faq_closed', tracksArgs ) );
			}
		},
		[ siteId, dispatch ]
	);

	return (
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		<>
			<section className="jetpack-faq">
				<h2 className="jetpack-faq__heading">{ translate( 'Frequently Asked Questions' ) }</h2>
				<ul className="jetpack-faq__list">
					<li>
						<FoldableFAQ
							id="getting-started"
							question={ translate( 'How do I start using Jetpack on my website?' ) }
							onToggle={ onFaqToggle }
							className="jetpack-faq__section"
						>
							{ translate(
								'Learn everything you need to know about getting started with Jetpack {{gettingStartedLink}}here{{/gettingStartedLink}}.',
								{
									components: { gettingStartedLink: jetpackGettingStartedLink() },
								}
							) }
						</FoldableFAQ>
					</li>
					<li>
						<FoldableFAQ
							id="scan-infected-sites"
							question={ translate(
								'Can I use Jetpack Scan to fix a site that is already infected?'
							) }
							onToggle={ onFaqToggle }
							className="jetpack-faq__section"
						>
							{ translate(
								'Jetpack Protect (Scan) detects and prevents attacks, but is not designed to fully clean up sites infected before it was active. If your site has malware, take immediate action to clean it up and remove the malicious code. {{br/}} To clean up your site, we suggest using a malware removal tool, or if possible restore from a backup taken before the infection. We recommend using Jetpack VaultPress Backup in conjunction with Jetpack Scan to secure your website. {{br/}} {{JetpackScanLearnMoreLink}}Learn more about cleaning your site{{/JetpackScanLearnMoreLink}}.',
								{
									components: {
										br: <br />,
										JetpackScanLearnMoreLink: getSupportLink(
											'how-to-clean-your-hacked-wordpress-site'
										),
									},
								}
							) }
						</FoldableFAQ>
					</li>
					<li>
						<FoldableFAQ
							id="backup-storage-limits"
							question={ translate( 'How do backup storage limits work?' ) }
							onToggle={ onFaqToggle }
							className="jetpack-faq__section"
						>
							{ translate(
								'If your backup storage limit is reached, older backups will be deleted and, depending on your site’s size, the backup retention period (archive) might be reduced to %(monthlyDays)d days. This will affect how far back you can see backups in your activity log. Existing backups can still be restored, but new updates won’t be backed up until you upgrade or free up storage.',
								{
									args: { monthlyDays: 7 },
								}
							) }
						</FoldableFAQ>
					</li>
					<li>
						<FoldableFAQ
							id="priority-support"
							question={ translate( 'Is priority support included in all plans?' ) }
							onToggle={ onFaqToggle }
							className="jetpack-faq__section"
						>
							{ translate(
								'Yes, our expert Happiness Engineers provide priority support to all customers with paid plans and services! Have a question or a problem? Just {{helpLink}}contact support{{/helpLink}} and we’ll get back to you in no time.',
								{
									components: { helpLink: getHelpLink( 'more_questions' ) },
								}
							) }
						</FoldableFAQ>
					</li>
					<li>
						<FoldableFAQ
							id="cancellation-policy"
							question={ translate( 'What is your cancellation policy?' ) }
							onToggle={ onFaqToggle }
							className="jetpack-faq__section"
						>
							{ translate(
								'If you are dissatisfied for any reason, we offer full refunds within %(annualDays)d days for yearly plans, and within %(monthlyDays)d days for monthly plans. If you have a question about our paid plans, {{helpLink}}please let us know{{/helpLink}}!',
								{
									args: { annualDays: 14, monthlyDays: 7 },
									components: { helpLink: getHelpLink( 'cancellation' ) },
								}
							) }
						</FoldableFAQ>
					</li>
					<li>
						<FoldableFAQ
							id="volume-discount"
							question={ translate( 'Do you have any discounts for multiple sites?' ) }
							onToggle={ onFaqToggle }
							className="jetpack-faq__section"
						>
							{ translate(
								'Anyone with at least five websites can join our licensing platform and enjoy up to %(discountRate)s%% discount across all Jetpack products! You can learn more about our {{agenciesLink}}licensing platform and agency program here{{/agenciesLink}}.',
								{
									args: { discountRate: 60 },
									components: { agenciesLink: getAgenciesLink() },
								}
							) }
						</FoldableFAQ>
					</li>
					<li>
						<FoldableFAQ
							id="multiyear-plans"
							question={ translate( 'Do you have discounts for multi-year plans?' ) }
							onToggle={ onFaqToggle }
							className="jetpack-faq__section"
						>
							{ translate(
								"We currently do not offer multi-year subscriptions or discounts for Jetpack products. However if you're an Enterprise, {{helpLink}}contact us{{/helpLink}}.",
								{
									components: { helpLink: getHelpLink( 'multiyear-questions' ) },
								}
							) }
						</FoldableFAQ>
					</li>
					<li>
						<FoldableFAQ
							id="wpcom-account"
							question={ translate( 'Why do I need a WordPress.com account?' ) }
							onToggle={ onFaqToggle }
							className="jetpack-faq__section"
						>
							{ translate(
								'Many of Jetpack’s core features make use of the WordPress.com cloud. In order to make sure everything' +
									' works correctly, Jetpack requires you to connect a free WordPress.com account. If you don’t already' +
									' have an account you can easily create one during the connection process.'
							) }
						</FoldableFAQ>
					</li>
					<li>
						<FoldableFAQ
							id="hosting-requirements"
							question={ translate( 'What are the hosting requirements?' ) }
							onToggle={ onFaqToggle }
							className="jetpack-faq__section"
						>
							{ translate(
								'You should be running the latest version of WordPress and a publicly-accessible site with XML-RPC enabled.'
							) }
						</FoldableFAQ>
					</li>
					<li>
						<FoldableFAQ
							id="multisite-network"
							question={ translate( 'Does Jetpack work with a multisite network?' ) }
							onToggle={ onFaqToggle }
							className="jetpack-faq__section"
						>
							{ translate(
								'Jetpack’s free features are compatible with WordPress Multisite networks. Most paid features also work with Multisite networks, but each site requires its own subscription. Ad network is an exception and will only work with the main site.' +
									' Jetpack VaultPress Backup, Jetpack Scan, Jetpack Security, and Jetpack Complete are not currently compatible with Multisite networks.'
							) }
						</FoldableFAQ>
					</li>
					<li>
						<FoldableFAQ
							id="gdpr"
							question={ translate( 'Does Jetpack comply with the GDPR?', {
								comment:
									'GDPR refers to the General Data Protection Regulation in effect in the European Union',
							} ) }
							onToggle={ onFaqToggle }
							className="jetpack-faq__section"
						>
							{ translate(
								'Jetpack understands the General Data Protection Regulation. {{link}}Read more about how Jetpack is committed to operating in accordance with the GDPR.{{/link}}',
								{
									components: { link: jetpackGDPRLink() },
								}
							) }
						</FoldableFAQ>
					</li>
					<li>
						<FoldableFAQ
							id="more-questions"
							question={ translate( 'Have more questions?' ) }
							onToggle={ onFaqToggle }
							className="jetpack-faq__section"
						>
							{ translate(
								'No problem! Feel free to {{helpLink}}get in touch{{/helpLink}} with our Happiness Engineers.',
								{
									components: { helpLink: getHelpLink( 'more_questions' ) },
								}
							) }
						</FoldableFAQ>
					</li>
				</ul>
			</section>
		</>
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	);
};

export default JetpackFAQ;
