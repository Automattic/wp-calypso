import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import LostPasswordFormUntyped from '../lost-password-form';
import RecoverViaEmailForm from './recover-via-email-form';

type Mode = 'reset' | 'recovery-email';

interface LostPasswordContentProps {
	redirectToAfterLoginUrl?: string;
	oauth2ClientId?: number | string;
	locale?: string;
	from?: string;
	isWooJPC?: boolean;
	isWoo?: boolean;
	isJetpack?: boolean;
}

const LostPasswordForm = LostPasswordFormUntyped as React.ComponentType< LostPasswordContentProps >;

export default function LostPasswordContent( props: LostPasswordContentProps ) {
	const translate = useTranslate();
	const [ mode, setMode ] = useState< Mode >( 'reset' );

	if ( mode === 'recovery-email' ) {
		return (
			<>
				<RecoverViaEmailForm />
				<div className="login__form-help">
					<Button variant="link" onClick={ () => setMode( 'reset' ) }>
						{ translate( 'Back' ) }
					</Button>
				</div>
			</>
		);
	}

	return (
		<>
			<LostPasswordForm { ...props } />
			<div className="login__form-help">
				<Button variant="link" onClick={ () => setMode( 'recovery-email' ) }>
					{ translate( 'Access with your recovery email' ) }
				</Button>
			</div>
		</>
	);
}
