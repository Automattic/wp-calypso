import { Notice } from '@wordpress/components';

import './style.scss';

type DomainSearchNoticeProps = {
	status: 'error' | 'info';
	children: React.ReactNode;
	onDismiss?: () => void;
};

export const DomainSearchNotice = ( { status, children, onDismiss }: DomainSearchNoticeProps ) => {
	return (
		<Notice
			className="domain-search-notice"
			status={ status }
			isDismissible={ !! onDismiss }
			onRemove={ onDismiss }
		>
			{ children }
		</Notice>
	);
};
