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

const goToTwoFactorForm = () => page( '/account-recovery/reset-password/two-factor' );

export default localize( ( { className, translate } ) => (
	<AlternateAccessForm
		classname={ classnames( 'activation-key-form', className ) }
		label={ translate( 'Activation key or URL' ) }
		onSkip={ goToTwoFactorForm }
		description={
			translate(
				'When you sign up, we email you a unique activation link or key ' +
				'to verify your account. {{helpLink}}More information{{/helpLink}}.',
				{
					components: {
						helpLink: <a href={ support.ACCOUNT_RECOVERY } />
					}
				}
			)
		}
	/>
) );
