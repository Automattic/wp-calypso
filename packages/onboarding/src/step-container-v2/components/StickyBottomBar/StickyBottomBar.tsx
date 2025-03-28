import { ReactNode } from 'react';

import './style.scss';

interface StickyBottomBarProps {
	leftButton?: ReactNode;
	rightButton?: ReactNode;
	children?: ReactNode;
}

export const StickyBottomBar = ( { leftButton, rightButton, children }: StickyBottomBarProps ) => {
	return (
		<div className="step-container-v2__sticky-bottom-bar">
			{ leftButton && (
				<div className="step-container-v2__sticky-bottom-bar-left-button">{ leftButton }</div>
			) }
			{ children && (
				<div className="step-container-v2__sticky-bottom-bar-content">{ children }</div>
			) }
			{ rightButton && (
				<div className="step-container-v2__sticky-bottom-bar-right-button">{ rightButton }</div>
			) }
		</div>
	);
};
