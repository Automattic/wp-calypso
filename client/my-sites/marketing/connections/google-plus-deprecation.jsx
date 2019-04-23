/** @format */

/**
 * External dependencies
 */
import React, { Fragment } from 'react';
import { localize } from 'i18n-calypso';

const GooglePlusDeprication = ( { translate } ) => (
	<Fragment>
		<h3>{ translate( 'Google Plus support is being removed' ) }</h3>
		<p>
			{ translate(
				'Google recently {{a}}announced{{/a}} that Google Plus is shutting down in April 2019, and access via third-party tools like Jetpack will cease in March 2019.',
				{
					components: {
						a: (
							<a
								href="https://www.blog.google/technology/safety-security/expediting-changes-google-plus/"
								target="_blank"
								rel="noopener noreferrer"
							/>
						),
					},
				}
			) }
		</p>
		<p>
			{ translate(
				'For now, you can still post to Google Plus using existing connections, but you cannot add new connections. The ability to post will be removed in early 2019.'
			) }
		</p>
	</Fragment>
);

export default localize( GooglePlusDeprication );
