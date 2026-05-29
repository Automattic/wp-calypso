import './style.scss';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { closeSmall } from '@wordpress/icons';
import clsx from 'clsx';
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
			<div className="subscription-management__notice-icon">
				<img
					src={ { success: successIcon, warning: warningIcon, error: errorIcon }[ type ] }
					alt=""
				/>
			</div>
			<div className="subscription-management__notice-content">{ children }</div>
			{ action && <div className="subscription-management__notice-action">{ action }</div> }
			{ onClose && (
				<Button
					className="subscription-management__notice-close"
					icon={ closeSmall }
					label={ __( 'Dismiss notice' ) }
					onClick={ onClose }
				/>
			) }
		</div>
	) : null;
};

export default Notice;
