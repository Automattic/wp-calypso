import { WordPressLogo, WordPressWordmark } from '@automattic/components';
import { ReactNode } from 'react';

import './style.scss';

interface TopBarProps {
	backButton?: ReactNode;
	skipButton?: ReactNode;
}

export const TopBar = ( { backButton, skipButton }: TopBarProps ) => {
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

			{ backButton && (
				<>
					<div className="step-container-v2__top-bar-divider" />
					<div className="step-container-v2__top-bar-left-button">{ backButton }</div>
				</>
			) }
			{ skipButton && (
				<div className="step-container-v2__top-bar-right-button">{ skipButton }</div>
			) }
		</div>
	);
};
