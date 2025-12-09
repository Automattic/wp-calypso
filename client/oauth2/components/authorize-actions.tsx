import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';

interface AuthorizeActionsProps {
	onApprove: () => void;
	onDeny: () => void;
	approveButtonText?: string;
	denyButtonText?: string;
	approveButtonVariant?: 'primary' | 'secondary' | 'tertiary' | 'link';
	denyButtonVariant?: 'primary' | 'secondary' | 'tertiary' | 'link';
	approveButtonClassName?: string;
	denyButtonClassName?: string;
}

const AuthorizeActions = ( {
	onApprove,
	onDeny,
	approveButtonText,
	denyButtonText,
	approveButtonVariant = 'primary',
	denyButtonVariant = 'secondary',
	approveButtonClassName,
	denyButtonClassName,
}: AuthorizeActionsProps ) => {
	const translate = useTranslate();

	return (
		<div className="oauth2-connect__actions">
			<Button variant={ denyButtonVariant } onClick={ onDeny } className={ denyButtonClassName }>
				{ denyButtonText || translate( 'Deny' ) }
			</Button>
			<Button
				variant={ approveButtonVariant }
				onClick={ onApprove }
				className={ approveButtonClassName }
			>
				{ approveButtonText || translate( 'Approve' ) }
			</Button>
		</div>
	);
};

export default AuthorizeActions;
