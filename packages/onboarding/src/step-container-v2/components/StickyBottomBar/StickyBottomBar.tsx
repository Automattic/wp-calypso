import { ReactNode } from 'react';

import './style.scss';

interface StickyBottomBarProps {
	leftButton?: ReactNode;
	rightButton?: ReactNode;
}

export const StickyBottomBar = ( { leftButton, rightButton }: StickyBottomBarProps ) => {
	return (
		<div className="step-container-v2__sticky-bottom-bar">
			{ leftButton && (
				<div className="step-container-v2__sticky-bottom-bar-left-button">{ leftButton }</div>
			) }
			{ rightButton && (
				<div className="step-container-v2__sticky-bottom-bar-right-button">{ rightButton }</div>
			) }
		</div>
	);
};
