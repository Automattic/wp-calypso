import page from '@automattic/calypso-router';
import { Button } from '@wordpress/components';
import { addQueryArgs, removeQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import LostPasswordFormUntyped from '../lost-password-form';
import RecoverViaEmailForm from './recover-via-email-form';

interface LostPasswordContentProps {
	redirectToAfterLoginUrl?: string;
	oauth2ClientId?: number | string;
	locale?: string;
	from?: string;
	isWooJPC?: boolean;
	isWoo?: boolean;
	isJetpack?: boolean;
	showRecoveryEmail?: boolean;
}

const LostPasswordForm = LostPasswordFormUntyped as React.ComponentType< LostPasswordContentProps >;

const currentUrl = () => window.location.pathname + window.location.search;

export default function LostPasswordContent( {
	showRecoveryEmail,
	...formProps
}: LostPasswordContentProps ) {
	const translate = useTranslate();

	if ( showRecoveryEmail ) {
		return (
			<>
				<RecoverViaEmailForm />
				<div className="login__form-help">
					<Button
						variant="link"
						onClick={ () => page( removeQueryArgs( currentUrl(), 'recovery_email' ) ) }
					>
						{ translate( 'Back' ) }
					</Button>
				</div>
			</>
		);
	}

	return (
		<>
			<LostPasswordForm { ...formProps } />
			<div className="login__form-help">
				<Button
					variant="link"
					onClick={ () => page( addQueryArgs( currentUrl(), { recovery_email: 1 } ) ) }
				>
					{ translate( 'Access with your recovery email' ) }
				</Button>
			</div>
		</>
	);
}
