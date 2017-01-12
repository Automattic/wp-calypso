/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import classnames from 'classnames';
import page from 'page';

/**
 * Internal dependencies
 */
import AlternateAccessForm from './alternate-access-form';
import support from 'lib/url/support';

const goToEmailForm = () => page( '/account-recovery/reset-password/email' );

export default localize( ( { className, translate } ) => (
	<AlternateAccessForm
		classname={ classnames( 'two-factor-code-form', className ) }
		label={ translate( 'Two factor authentication codes' ) }
		onSkip={ goToEmailForm }
		description={
			translate(
				'If you set up two factor authentication, you can provide a current code ' +
				'from your authenticator app here to prove ownership. ' +
				'{{helpLink}}More information{{/helpLink}}.',
				{
					components: {
						helpLink: <a href={ support.ACCOUNT_RECOVERY } />
					}
				}
			)
		}
	/>
) );
