import './style.scss';
import clsx from 'clsx';
import { translate } from 'i18n-calypso';
import closeIcon from './images/close.svg';
import errorIcon from './images/error.svg';
import successIcon from './images/success.svg';
import warningIcon from './images/warning.svg';

export enum NoticeType {
	Success = 'success',
	Warning = 'warning',
	Error = 'error',
}

export type NoticeState = {
	type: NoticeType;
	message: string | React.ReactNode;
	onClose?: () => void;
	action?: React.ReactNode;
};

type NoticeProps = {
	children: React.ReactNode;
	className?: string;
	action?: React.ReactNode;
	type?: NoticeType;
	onClose?: () => void;
	visible?: boolean;
};

const Notice = ( {
	children,
	className,
	action,
	type = NoticeType.Success,
	onClose,
	visible = true,
}: NoticeProps ) => {
	return visible ? (
		<div
			className={ clsx(
				'subscription-management__notice',
				`subscription-management__notice--${ type }`,
				className
			) }
		>
			{ onClose && (
				<a
					className="subscription-management__notice-close"
					href="#close"
					onClick={ ( e ) => {
						e.preventDefault();
						onClose?.();
					} }
				>
					<img
						src={ closeIcon }
						alt={ translate( 'Close', { context: 'Hide the notice' } ) as string }
					/>
				</a>
			) }
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
