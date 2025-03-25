import { WordPressLogo, WordPressWordmark } from '@automattic/components';
import { ReactNode } from 'react';
import { useStepContainerV2InternalContext } from '../../contexts/StepContainerV2InternalContext';

import './style.scss';

interface TopBarProps {
	leftButton?: ReactNode;
	rightButton?: ReactNode;
}

export const TopBar = ( { leftButton, rightButton }: TopBarProps ) => {
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

			{ leftButton && (
				<>
					<div className="step-container-v2__top-bar-divider" />
					<div className="step-container-v2__top-bar-left-button">{ leftButton }</div>
				</>
			) }
			{ rightButton && (
				<div className="step-container-v2__top-bar-right-button">{ rightButton }</div>
			) }
		</div>
	);
};
