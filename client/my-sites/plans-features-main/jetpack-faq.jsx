/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FAQ from 'components/faq';
import FAQItem from 'components/faq/faq-item';
import HappychatButton from 'components/happychat/button';
import isHappychatAvailable from 'state/happychat/selectors/is-happychat-available';
import { isEnabled } from 'config';

const JetpackFAQ = ( { isChatAvailable, translate } ) => {
	const helpLink =
		isEnabled( 'jetpack/happychat' ) && isChatAvailable ? (
			<HappychatButton className="plans-features-main__happychat-button" />
		) : (
			<a href="https://jetpack.com/contact-support/" target="_blank" rel="noopener noreferrer" />
		);

	return (
		<FAQ>
			<FAQItem
				question={ translate( 'I signed up and paid. What’s next?' ) }
				answer={ translate(
					'Our premium features are powered by a few of our other plugins. After purchasing you will' +
						' need to install the Akismet and VaultPress plugins. Just follow the guide' +
						' after you complete your purchase.'
				) }
			/>

			<FAQItem
				question={ translate( 'What are the hosting requirements?' ) }
				answer={ translate(
					'You should be running the latest version of WordPress and be using a web host that runs' +
						' PHP 5 or higher. You will also need a WordPress.com account (you can register' +
						' during the connection process) and a publicly-accessible site with XML-RPC enabled.'
				) }
			/>

			<FAQItem
				question={ translate( 'Does this work with a multisite network?' ) }
				answer={ translate(
					"Yes, Jetpack and all of it's paid features are compatible with WordPress Multisite" +
						' networks, except for Jetpack Backup.'
				) }
			/>

			<FAQItem
				question={ translate( 'Why do I need a WordPress.com account?' ) }
				answer={ translate(
					"Many of Jetpack's core features make use of the WordPress.com cloud. In order to make sure" +
						' everything works correctly, Jetpack requires you to connect a (free) WordPress.com' +
						" account. If you don't already have an account you can easily create one during the" +
						' connection process.'
				) }
			/>

			<FAQItem
				question={ translate( 'What is the cancellation policy?' ) }
				answer={ translate(
					'You can request a cancellation within 30 days of purchase and receive a full refund.'
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

export default connect( ( state ) => ( {
	isChatAvailable: isHappychatAvailable( state ),
} ) )( localize( JetpackFAQ ) );
