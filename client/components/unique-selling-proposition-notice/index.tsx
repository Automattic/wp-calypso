import { Icon, globe } from '@wordpress/icons';
import clsx from 'clsx';

import './style.scss';

type UniqueSellingPropositionNoticeProps = {
	children: JSX.Element | string;
	className?: string;
};

const UniqueSellingPropositionNotice = ( {
	children,
	className,
}: UniqueSellingPropositionNoticeProps ) => {
	return (
		<div className={ clsx( 'unique-selling-proposition-notice', className ) }>
			<span className="unique-selling-proposition-notice-icon">
				<Icon icon={ globe } size={ 16 } />
			</span>
			<span className="unique-selling-proposition-notice-text">{ children }</span>
		</div>
	);
};

export default UniqueSellingPropositionNotice;
