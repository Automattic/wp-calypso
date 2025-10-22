import { Icon, info, error } from '@wordpress/icons';
import { FC, ReactNode } from 'react';
import './accordion-notice.scss';

interface AccordionNoticeProps {
	children: ReactNode;
	variant?: 'error' | 'info';
}

export const AccordionNotice: FC< AccordionNoticeProps > = ( { children, variant = 'error' } ) => {
	const icon = variant === 'error' ? error : info;

	return (
		<div
			className={ `migration-site-ssh__accordion-notice migration-site-ssh__accordion-notice--${ variant }` }
		>
			<div className="migration-site-ssh__accordion-notice-icon">
				<Icon icon={ icon } size={ 24 } />
			</div>
			<div className="migration-site-ssh__accordion-notice-content">
				<div className="migration-site-ssh__accordion-notice-texts">
					<div className="migration-site-ssh__accordion-notice-text">{ children }</div>
				</div>
			</div>
		</div>
	);
};
