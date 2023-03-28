import './style.scss';
import { translate } from 'i18n-calypso';
import closeIcon from './images/close.svg';
import errorIcon from './images/error.svg';
import successIcon from './images/success.svg';
import warningIcon from './images/warning.svg';

type NoticeProps = {
	children: React.ReactNode;
	action?: React.ReactNode;
	type?: 'success' | 'warning' | 'error';
	onClose: () => void;
	visible: boolean;
};

const Notice = ( { children, action, type = 'success', onClose, visible = true }: NoticeProps ) => {
	return visible ? (
		<div className={ `subscription-management__notice subscription-management__notice--${ type }` }>
			<a
				className="subscription-management__notice-close"
				href="#close"
				onClick={ ( e ) => {
					e.preventDefault();
					onClose();
				} }
			>
				<img
					src={ closeIcon }
					alt={ translate( 'Close', { context: 'Hide the notice' } ) as string }
				/>
			</a>
			<div className="subscription-management__notice-icon">
				<img
					src={ { success: successIcon, warning: warningIcon, error: errorIcon }[ type ] }
					alt=""
				/>
			</div>
			<div className="subscription-management__notice-content">{ children }</div>
			{ action && <div className="subscription-management__notice-action">{ action }</div> }
		</div>
	) : null;
};

export default Notice;
