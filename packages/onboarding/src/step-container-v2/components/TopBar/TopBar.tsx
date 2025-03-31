import { WordPressLogo, WordPressWordmark } from '@automattic/components';
import { ReactNode } from 'react';

import './style.scss';

interface TopBarProps {
	leftElement?: ReactNode;
	rightElement?: ReactNode;
}

export const TopBar = ( { leftElement, rightElement }: TopBarProps ) => {
	return (
		<div className="step-container-v2__top-bar">
			<WordPressWordmark
				className="step-container-v2__top-bar-wordpress-logo step-container-v2__top-bar-wordpress-logo--wordmark"
				color="currentColor"
			/>
			<WordPressLogo
				size={ 21 }
				className="step-container-v2__top-bar-wordpress-logo step-container-v2__top-bar-wordpress-logo--logo"
			/>

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
