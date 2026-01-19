import clsx from 'clsx';
import { ReactNode } from 'react';

import './style.scss';

interface StickyBottomBarProps {
	leftElement?: ReactNode;
	centerElement?: ReactNode;
	rightElement?: ReactNode;
	className?: string;
}

export const StickyBottomBar = ( {
	leftElement,
	centerElement,
	rightElement,
	className,
}: StickyBottomBarProps ) => {
	return (
		<div className={ clsx( 'step-container-v2__sticky-bottom-bar', className ) }>
			{ leftElement && (
				<div className="step-container-v2__sticky-bottom-bar-left-element">{ leftElement }</div>
			) }
			{ centerElement && (
				<div className="step-container-v2__sticky-bottom-bar-center-element">{ centerElement }</div>
			) }
			{ rightElement && (
				<div className="step-container-v2__sticky-bottom-bar-right-element">{ rightElement }</div>
			) }
		</div>
	);
};
