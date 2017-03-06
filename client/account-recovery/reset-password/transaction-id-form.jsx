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

const goToActivationKeyForm = () => page( '/account-recovery/reset-password/activation-key' );

export default localize( ( { className, translate } ) => (
	<AlternateAccessForm
		classname={ classnames( 'transaction-id-form', className ) }
		label={ translate( 'Transaction ID' ) }
		onSkip={ goToActivationKeyForm }
		description={
			translate(
				'If you have purchased any upgrades on WordPress.com, this number ' +
				'will be in your receipt from PayPal or in your PayPal account. ' +
				'{{helpLink}}Need help to find your transaction id?{{/helpLink}}',
				{
					components: {
						helpLink: <a href={ support.ACCOUNT_RECOVERY } />
					}
				}
			)
		}
	/>
) );
