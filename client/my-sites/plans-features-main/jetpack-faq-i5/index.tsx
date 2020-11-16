/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FoldableFAQ from 'calypso/components/foldable-faq';
import { getHelpLink } from '../jetpack-faq';

/**
 * Style dependencies
 */
import './style.scss';

const JetpackFAQi5: React.FC = () => {
	const translate = useTranslate();

	return (
		<>
			<section className="jetpack-faq-i5">
				<h2 className="jetpack-faq-i5__heading">Frequently Asked Questions</h2>

				<FoldableFAQ id="faq-1" question={ translate( 'What is the cancellation policy?' ) }>
					{ translate(
						'We want to make sure Jetpack is exactly what you need, so you can request a cancellation' +
							' within 30 days of purchase and receive a full refund. If there’s something you’d like' +
							' to see changed in Jetpack to better suit your needs, {{helpLink}}please let us know{{/helpLink}}!',
						{
							components: { helpLink: getHelpLink( 'cancellation' ) },
						}
					) }
				</FoldableFAQ>

				<FoldableFAQ id="faq-2" question={ translate( 'Why do I need a WordPress.com account?' ) }>
					{ translate(
						"Many of Jetpack's core features make use of the WordPress.com cloud. In order to make sure everything" +
							" works correctly, Jetpack requires you to connect a free WordPress.com account. If you don't already" +
							' have an account you can easily create one during the connection process.'
					) }
				</FoldableFAQ>

				<FoldableFAQ id="faq-3" question={ translate( 'What are the hosting requirements?' ) }>
					{ translate(
						'You should be running the latest version of WordPress and a publicly-accessible site with XML-RPC enabled.'
					) }
				</FoldableFAQ>

				<FoldableFAQ
					id="faq-4"
					question={ translate( 'Does this work with a multisite network?' ) }
				>
					{ translate(
						'Jetpack’s free features are compatible with WordPress Multisite networks. Paid features' +
							' also work with Multisite networks, but each site requires its own subscription. Jetpack Backup' +
							' and Jetpack Scan are not currently compatible with Multisite networks.'
					) }
				</FoldableFAQ>

				<FoldableFAQ id="faq-5" question={ translate( 'Have more questions?' ) }>
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
