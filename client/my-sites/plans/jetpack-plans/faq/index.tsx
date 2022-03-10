import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FoldableFAQ from 'calypso/components/foldable-faq';
import { getAgenciesLink, getHelpLink } from 'calypso/my-sites/plans-features-main/jetpack-faq';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';

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

const JetpackFAQ: React.FC = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const siteId = useSelector( getSelectedSiteId );

	const onFaqToggle = useCallback(
		( faqArgs: { id: string; isExpanded: boolean; height: number } ) => {
			const { id, isExpanded } = faqArgs;
			const tracksArgs = {
				site_id: siteId,
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
		[ siteId, dispatch ]
	);

	return (
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		<>
			<section className="jetpack-faq">
				<h2 className="jetpack-faq__heading">{ translate( 'Frequently Asked Questions' ) }</h2>
				<FoldableFAQ
					id="priority-support"
					question={ translate( 'How do I start using Jetpack on my website?' ) }
					onToggle={ onFaqToggle }
				>
					{ translate(
						'Learn everything you need to know about getting started with Jetpack {{gettingStartedLink}}here{{/gettingStartedLink}}.',
						{
							components: { gettingStartedLink: jetpackGettingStartedLink() },
						}
					) }
				</FoldableFAQ>
				<FoldableFAQ
					id="priority-support"
					question={ translate( 'Is priority support included in all plans?' ) }
					onToggle={ onFaqToggle }
				>
					{ translate(
						'Yes, our expert Happiness Engineers provide priority support to all customers with paid plans and services! Have a question or a problem? Just {{helpLink}}contact support{{/helpLink}} and we’ll get back to you in no time.',
						{
							components: { helpLink: getHelpLink( 'more_questions' ) },
						}
					) }
				</FoldableFAQ>
				<FoldableFAQ
					id="cancellation-policy"
					question={ translate( 'What is your cancellation policy?' ) }
					onToggle={ onFaqToggle }
				>
					{ translate(
						'If you are dissatisfied for any reason, we offer full refunds within %(annualDays)d days for yearly plans, and within %(monthlyDays)d days for monthly plans. If you have a question about our paid plans, {{helpLink}}please let us know{{/helpLink}}!',
						{
							args: { annualDays: 14, monthlyDays: 7 },
							components: { helpLink: getHelpLink( 'cancellation' ) },
						}
					) }
				</FoldableFAQ>
				<FoldableFAQ
					id="volume-discount"
					question={ translate( 'Do you have any discounts for multiple sites?' ) }
					onToggle={ onFaqToggle }
				>
					{ translate(
						'Anyone with at least five websites can join our licensing platform and enjoy a 25% discount across all Jetpack products! You can learn more about our {{agenciesLink}}licensing platform and agency program here{{/agenciesLink}}.',
						{
							components: { agenciesLink: getAgenciesLink() },
						}
					) }
				</FoldableFAQ>
				<FoldableFAQ
					id="wpcom-account"
					question={ translate( 'Why do I need a WordPress.com account?' ) }
					onToggle={ onFaqToggle }
				>
					{ translate(
						'Many of Jetpack’s core features make use of the WordPress.com cloud. In order to make sure everything' +
							' works correctly, Jetpack requires you to connect a free WordPress.com account. If you don’t already' +
							' have an account you can easily create one during the connection process.'
					) }
				</FoldableFAQ>
				<FoldableFAQ
					id="hosting-requirements"
					question={ translate( 'What are the hosting requirements?' ) }
					onToggle={ onFaqToggle }
				>
					{ translate(
						'You should be running the latest version of WordPress and a publicly-accessible site with XML-RPC enabled.'
					) }
				</FoldableFAQ>
				<FoldableFAQ
					id="multisite-network"
					question={ translate( 'Does this work with a multisite network?' ) }
					onToggle={ onFaqToggle }
				>
					{ translate(
						'Jetpack’s free features are compatible with WordPress Multisite networks. Paid features' +
							' also work with Multisite networks, but each site requires its own subscription. Jetpack Backup' +
							' and Jetpack Scan are not currently compatible with Multisite networks.'
					) }
				</FoldableFAQ>
				<FoldableFAQ
					id="more-questions"
					question={ translate( 'Have more questions?' ) }
					onToggle={ onFaqToggle }
				>
					{ translate(
						'No problem! Feel free to {{helpLink}}get in touch{{/helpLink}} with our Happiness Engineers.',
						{
							components: { helpLink: getHelpLink( 'more_questions' ) },
						}
					) }
				</FoldableFAQ>
			</section>
		</>
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	);
};

export default JetpackFAQ;
