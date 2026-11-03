import Notice from 'calypso/dashboard/components/notice';

import './login-error-notice.scss';

interface LoginErrorNoticeProps {
	children: React.ReactNode;
	onClose?: () => void;
}

/**
 * The error box for the login screens. Errors tied to one field stay inline under that field.
 */
export default function LoginErrorNotice( { children, onClose }: LoginErrorNoticeProps ) {
	return (
		// Inserted in answer to something the reader did, so it is spoken rather than only shown.
		<div className="login__error-notice" role="alert">
			<Notice variant="error" onClose={ onClose }>
				{ children }
			</Notice>
		</div>
	);
}
