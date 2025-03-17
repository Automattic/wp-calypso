import { WordPressLogo, WordPressWordmark } from '@automattic/components';
import { ReactNode } from 'react';
import { useStepContainerV2InternalContext } from '../../contexts/StepContainerV2InternalContext';

import './style.scss';

interface TopBarProps {
	backButton?: ReactNode;
	skipButton?: ReactNode;
}

export const TopBar = ( { backButton, skipButton }: TopBarProps ) => {
	const { isMediumViewport } = useStepContainerV2InternalContext();

	return (
		<div className="step-container-v2__top-bar">
			{ isMediumViewport ? (
				<WordPressWordmark
					className="step-container-v2__top-bar-wordpress-logo"
					color="currentColor"
				/>
			) : (
				<WordPressLogo size={ 21 } className="step-container-v2__top-bar-wordpress-logo" />
			) }

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
