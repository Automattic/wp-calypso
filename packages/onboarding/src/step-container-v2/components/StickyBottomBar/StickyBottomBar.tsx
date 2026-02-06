import clsx from 'clsx';
import type { ReactNode } from 'react';

import './style.scss';

interface StickyBottomBarProps {
	leftElement?: ReactNode;
	centerElement?: ReactNode;
	rightElement?: ReactNode;
	noBoxShadow?: boolean;
	hasTransparentBackground?: boolean;
	centerText?: boolean;
	fullWidth?: boolean;
}

export const StickyBottomBar = ( {
	leftElement,
	centerElement,
	rightElement,
	noBoxShadow,
	hasTransparentBackground,
	centerText,
	fullWidth,
}: StickyBottomBarProps ) => {
	return (
		<div
			className={ clsx( 'step-container-v2__sticky-bottom-bar', {
				'step-container-v2__sticky-bottom-bar--no-box-shadow': noBoxShadow === true,
				'step-container-v2__sticky-bottom-bar--center-text': centerText === true,
				'step-container-v2__sticky-bottom-bar--full-width': fullWidth === true,
				'step-container-v2__sticky-bottom-bar--has-transparent-background':
					hasTransparentBackground === true,
			} ) }
		>
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
