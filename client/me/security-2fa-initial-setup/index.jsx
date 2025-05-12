import { CompactCard } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import VerticalNavItemEnhanced from 'calypso/components/vertical-nav/item/enhanced';
import { gaRecordEvent } from 'calypso/lib/analytics/ga';
import { APP_BASED_2FA_SETUP, SMS_BASED_2FA_SETUP } from 'calypso/me/security-2fa-setup';

import './style.scss';

const Security2faInitialSetup = ( { onSuccess } ) => {
	const translate = useTranslate();

	const handleClick = useCallback(
		( event, authMethod ) => {
			gaRecordEvent( 'Me', 'Clicked On 2fa Get Started Button' );
			onSuccess( event, authMethod );
		},
		[ onSuccess ]
	);

	return (
		<>
			<CompactCard>
				{ translate(
					'Keep your account extra safe with Two-Step Authentication. You’ll use your password plus a temporary code from your phone to sign in.'
				) }
			</CompactCard>

			<VerticalNavItemEnhanced
				className="security-initial-setup-nav-item"
				gridicon="phone"
				onClick={ ( event ) => handleClick( event, APP_BASED_2FA_SETUP ) }
				text={ translate( 'Set up using an app' ) }
				description={ translate(
					'Set up with an app. Use an app to generate two-step authentication codes.'
				) }
			/>

			<VerticalNavItemEnhanced
				className="security-initial-setup-nav-item"
				gridicon="comment"
				onClick={ ( event ) => handleClick( event, SMS_BASED_2FA_SETUP ) }
				text={ translate( 'Set up using SMS' ) }
				description={ translate(
					'Set up with SMS. Receive two-step authentication codes by text message.'
				) }
			/>
		</>
	);
};

export default Security2faInitialSetup;
