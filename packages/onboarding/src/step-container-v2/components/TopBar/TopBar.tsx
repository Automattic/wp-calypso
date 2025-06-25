import { WordPressLogo, WordPressWordmark } from '@automattic/components';
import clsx from 'clsx';
import { ReactNode } from 'react';

import './style.scss';

interface TopBarProps {
	leftElement?: ReactNode;
	rightElement?: ReactNode;
	logo?: ReactNode;
	compact?: boolean;
}

export const TopBar = ( { leftElement, rightElement, logo, compact }: TopBarProps ) => {
	const defaultLogo = (
		<>
			{ ! compact && (
				<WordPressWordmark
					className="step-container-v2__top-bar-wordpress-logo step-container-v2__top-bar-wordpress-logo--wordmark"
					color="currentColor"
				/>
			) }
			<WordPressLogo
				size={ 21 }
				className={ clsx(
					'step-container-v2__top-bar-wordpress-logo step-container-v2__top-bar-wordpress-logo--logo',
					{ 'is-compact': compact }
				) }
			/>
		</>
	);
	return (
		<div className="step-container-v2__top-bar">
			{ logo ? logo : defaultLogo }

			{ leftElement && (
				<>
					<div className="step-container-v2__top-bar-divider" />
					<div className="step-container-v2__top-bar-left-element">{ leftElement }</div>
				</>
			) }
			{ rightElement && (
				<div className="step-container-v2__top-bar-right-element">{ rightElement }</div>
			) }
		</div>
	);
};
