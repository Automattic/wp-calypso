/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FAQ from 'components/faq';
import FAQItem from 'components/faq/faq-item';

const JetpackFAQ = ( { translate } ) => {
	const helpLink = (
		<a href="https://jetpack.com/contact-support/" target="_blank" rel="noopener noreferrer" />
	);

	return (
		<FAQ>
			<FAQItem
				question={ translate( 'What is the cancellation policy?' ) }
				answer={ translate(
					'We want to make sure Jetpack is exactly what you need, so you can request a cancellation' +
						' within 30 days of purchase and receive a full refund. If there’s something you’d like' +
						' to see changed in Jetpack to better suit your needs, {{helpLink}}please let us know{{/helpLink}}!',
					{
						components: { helpLink },
					}
				) }
			/>

			<FAQItem
				question={ translate( 'Why do I need a WordPress.com account?' ) }
				answer={ translate(
					"Many of Jetpack's core features make use of the WordPress.com cloud. In order to make sure everything" +
						" works correctly, Jetpack requires you to connect a free WordPress.com account. If you don't already" +
						' have an account you can easily create one during the connection process.'
				) }
			/>

			<FAQItem
				question={ translate( 'What are the hosting requirements?' ) }
				answer={ translate(
					'You should be running the latest version of WordPress and a publicly-accessible site with XML-RPC enabled.'
				) }
			/>

			<FAQItem
				question={ translate( 'Does this work with a multisite network?' ) }
				answer={ translate(
					'Jetpack’s free features are compatible with WordPress Multisite networks. Paid features' +
						' also work with Multisite networks, but each site requires its own subscription. Jetpack Backup' +
						' and Jetpack Scan are not currently compatible with Multisite networks.'
				) }
			/>

			<FAQItem
				question={ translate( 'Have more questions?' ) }
				answer={ translate(
					'No problem! Feel free to {{helpLink}}get in touch{{/helpLink}} with our Happiness Engineers.',
					{
						components: { helpLink },
					}
				) }
			/>
		</FAQ>
	);
};

export default localize( JetpackFAQ );
