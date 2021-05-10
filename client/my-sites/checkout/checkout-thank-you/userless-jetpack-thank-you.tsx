/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import JetpackLogo from 'calypso/components/jetpack-logo';
import { Card } from '@automattic/components';

const UserlessJetpackThankYou: FunctionComponent = () => {
	const translate = useTranslate();

	return (
		<Card>
			<JetpackLogo full={ true } />
			<h2>
				{ translate( 'Thank you for your purchase!' ) }
				{ String.fromCodePoint( 0x1f389 ) }
				{ /* Celebration emoji 🎉 */ }
			</h2>
		</Card>
	);
};

export default UserlessJetpackThankYou;
