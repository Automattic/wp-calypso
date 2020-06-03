/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ThankYou from './thank-you';
import versionCompare from 'lib/version-compare';

function SearchProductThankYou( { jetpackVersion } ) {
	const translate = useTranslate();
	return (
		<ThankYou
			illustration="/calypso/images/illustrations/thankYou.svg"
			showSearchRedirects
			title={ translate( 'Welcome to Jetpack Search!' ) }
		>
			<p>{ translate( 'We are currently indexing your site.' ) }</p>
			<p>
				{ jetpackVersion && versionCompare( jetpackVersion, '8.4', '<' )
					? translate(
							"In the meantime you'll need to update Jetpack to version 8.4 or higher in order " +
								"to get the most out of Jetpack Search. Once you've updated Jetpack, " +
								"we'll configure Search for you. You can try search and customize it to your liking."
					  )
					: translate(
							'In the meantime, we have configured Jetpack Search on your site — ' +
								'you should try customizing it in your traditional WordPress dashboard.'
					  ) }
			</p>
		</ThankYou>
	);
}

export default SearchProductThankYou;
