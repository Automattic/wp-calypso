/**
 * External dependencies
 */
import React, { ReactElement } from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import ThankYou, { ThankYouCtaType } from './thank-you';

const ThankYouCta: ThankYouCtaType = ( { dismissUrl, recordThankYouClick } ) => {
	const translate = useTranslate();
	return (
		<Button primary href={ dismissUrl } onClick={ () => recordThankYouClick( 'anti-spam' ) }>
			{ translate( 'Go back to your site' ) }
		</Button>
	);
};

const AntiSpamProductThankYou = (): ReactElement => {
	const translate = useTranslate();
	return (
		<ThankYou
			illustration="/calypso/images/illustrations/thankYou.svg"
			title={ translate( 'Say goodbye to spam!' ) }
			ThankYouCtaComponent={ ThankYouCta }
		>
			<p>
				{ translate(
					'Jetpack Anti-Spam is now active on your site and catching all spam. Enjoy more peace of mind and a better experience for your visitors.'
				) }
			</p>
		</ThankYou>
	);
};

export default AntiSpamProductThankYou;
