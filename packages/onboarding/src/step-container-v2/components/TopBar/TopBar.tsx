import { WordPressLogo, WordPressWordmark } from '@automattic/components';
import clsx from 'clsx';
import { isValidElement, type ReactElement, type ReactNode } from 'react';
import { useStepContainerV2Context } from '../../contexts/StepContainerV2Context';

import './style.scss';

export interface TopBarProps {
	leftElement?: ReactNode;
	rightElement?: ReactNode;

	/**
	 * Customize the TopBar logo. If this is not passed, the default logo will
	 * be used unless `hideLogo` is set.
	 */
	logo?: ReactNode;

	/**
	 * Hide the WordPress wordmark when `compactLogo` is set.
	 * Always show the WordPress logo instead.
	 * - This is critical for current Login views, where the logo (WordPressLogo) is always visible
	 * - Confirm with Design before changing functionality around this
	 */
	compactLogo?: 'always';

	/**
	 * Hide the logo entirely.
	 */
	hideLogo?: boolean;
}

export const TopBar = ( {
	leftElement,
	rightElement,
	logo,
	compactLogo,
	hideLogo = false,
}: TopBarProps ) => {
	const context = useStepContainerV2Context();

	// Context logo takes precedence over default WordPress logo.
	// The `logo` prop provides an explicit override for both.
	const defaultWordPressLogo = (
		<div
			className={ clsx( 'step-container-v2__top-bar-wordpress-logo-wrapper', {
				'is-compact': compactLogo,
			} ) }
		>
			{ ! compactLogo && (
				<WordPressWordmark
					className="step-container-v2__top-bar-wordpress-logo step-container-v2__top-bar-wordpress-logo--wordmark"
					color="currentColor"
				/>
			) }
			<WordPressLogo
				size={ 21 }
				className="step-container-v2__top-bar-wordpress-logo step-container-v2__top-bar-wordpress-logo--logo"
			/>
		</div>
	);

	const resolvedLogo = logo ?? context.logo ?? defaultWordPressLogo;

	return (
		<div className="step-container-v2__top-bar">
			{ ! hideLogo && resolvedLogo }

			{ ! hideLogo && leftElement && <div className="step-container-v2__top-bar-divider" /> }

			{ leftElement && (
				<div className="step-container-v2__top-bar-left-element">{ leftElement }</div>
			) }
			{ rightElement && (
				<div className="step-container-v2__top-bar-right-element">{ rightElement }</div>
			) }
		</div>
	);
};

export const isTopBar = ( element?: ReactNode ): element is ReactElement< TopBarProps > => {
	return isValidElement( element ) && element.type === TopBar;
};
