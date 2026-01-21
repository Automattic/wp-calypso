import { Icon, globe } from '@wordpress/icons';
import clsx from 'clsx';

import './style.scss';

type InfoNoticeProps = {
	children: JSX.Element | string;
	className?: string;
};

const InfoNotice = ( { children, className }: InfoNoticeProps ) => {
	return (
		<div className={ clsx( 'social-buttons__info-notice', className ) }>
			<span className="social-buttons__info-notice-icon">
				<Icon icon={ globe } size={ 16 } />
			</span>
			<span className="social-buttons__info-notice-text">{ children }</span>
		</div>
	);
};

export default InfoNotice;
