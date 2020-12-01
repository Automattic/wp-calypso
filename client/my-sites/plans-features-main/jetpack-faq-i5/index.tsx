/**
 * External dependencies
 */
import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FoldableFAQ from 'calypso/components/foldable-faq';
import { getHelpLink } from '../jetpack-faq';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

/**
 * Style dependencies
 */
import './style.scss';

const JetpackFAQi5: React.FC = () => {
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
		<>
			<section className="jetpack-faq-i5">
				<h2 className="jetpack-faq-i5__heading">{ translate( 'Frequently Asked Questions' ) }</h2>

				<FoldableFAQ
					id="faq-1"
					question={ translate( 'What is the cancellation policy?' ) }
					onToggle={ onFaqToggle }
				>
					{ translate(
						'We want to make sure Jetpack is exactly what you need, so you can request a cancellation' +
							' within 30 days of purchase and receive a full refund. If there’s something you’d like' +
							' to see changed in Jetpack to better suit your needs, {{helpLink}}please let us know{{/helpLink}}!',
						{
							components: { helpLink: getHelpLink( 'cancellation' ) },
						}
					) }
				</FoldableFAQ>

				<FoldableFAQ
					id="faq-2"
					question={ translate( 'Why do I need a WordPress.com account?' ) }
					onToggle={ onFaqToggle }
				>
					{ translate(
						"Many of Jetpack's core features make use of the WordPress.com cloud. In order to make sure everything" +
							" works correctly, Jetpack requires you to connect a free WordPress.com account. If you don't already" +
							' have an account you can easily create one during the connection process.'
					) }
				</FoldableFAQ>

				<FoldableFAQ
					id="faq-3"
					question={ translate( 'What are the hosting requirements?' ) }
					onToggle={ onFaqToggle }
				>
					{ translate(
						'You should be running the latest version of WordPress and a publicly-accessible site with XML-RPC enabled.'
					) }
				</FoldableFAQ>

				<FoldableFAQ
					id="faq-4"
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
					id="faq-5"
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
	);
};

export default JetpackFAQi5;
