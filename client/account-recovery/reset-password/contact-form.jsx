/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import AlternateAccessForm from './alternate-access-form';
import support from 'lib/url/support';

export default localize( ( { className, translate } ) => (
	<AlternateAccessForm
		classname={ classnames( 'contact-form', className ) }
		label={ translate( 'Contact information' ) }
		description={
			translate(
				'What email address should we contact you at? Please, double check ' +
				'that it is correctly spelled and you have access to it.',
				{
					components: {
						helpLink: <a href={ support.ACCOUNT_RECOVERY } />
					}
				}
			)
		}
	/>
) );
