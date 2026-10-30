import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import TwoFactorActions from './two-factor-actions';

import './verification-code-form.scss';
import './security-key-form.scss';

export default function SecurityKeyUnsupported( { switchTwoFactorAuthType } ) {
	const translate = useTranslate();

	return (
		<div className="two-factor-authentication__verification-code-form-wrapper">
			<Card className="two-factor-authentication__verification-code-form">
				<div className="security-key-form__help-text">
					<p>
						{ translate(
							'This browser doesn’t support passkeys or security keys. Try a different browser to log in with one.'
						) }
					</p>
				</div>
			</Card>
			<TwoFactorActions
				twoFactorAuthType="webauthn"
				switchTwoFactorAuthType={ switchTwoFactorAuthType }
			/>
		</div>
	);
}
