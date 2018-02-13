/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Gridicon from 'gridicons';

const JetpackOnboardingDisclaimer = ( { handleTosClick, translate } ) => (
	<p className="jetpack-onboarding__disclaimer">
		<Gridicon icon="info-outline" size={ 18 } />
		{ translate(
			'By continuing, you agree to our {{link}}fascinating terms and conditions{{/link}}.',
			{
				components: {
					link: (
						<a
							href="//wordpress.com/tos/"
							target="_blank"
							rel="noopener noreferrer"
							onClick={ handleTosClick }
						/>
					),
				},
			}
		) }
	</p>
);

export default localize( JetpackOnboardingDisclaimer );
