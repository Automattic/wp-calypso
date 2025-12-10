import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';

interface AuthorizeActionsProps {
	onApprove: () => void;
	onDeny: () => void;
	approveButtonText?: string;
	denyButtonText?: string;
	approveButtonClassName?: string;
	denyButtonClassName?: string;
}

const AuthorizeActions = ( {
	onApprove,
	onDeny,
	approveButtonText,
	denyButtonText,
	approveButtonClassName,
	denyButtonClassName,
}: AuthorizeActionsProps ) => {
	const translate = useTranslate();

	return (
		<div className="oauth2-connect__actions">
			<Button variant="secondary" onClick={ onDeny } className={ denyButtonClassName }>
				{ denyButtonText || translate( 'Deny' ) }
			</Button>
			<Button variant="primary" onClick={ onApprove } className={ approveButtonClassName }>
				{ approveButtonText || translate( 'Approve' ) }
			</Button>
		</div>
	);
};

export default AuthorizeActions;
