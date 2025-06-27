import { WordPressLogo, WordPressWordmark } from '@automattic/components';
import clsx from 'clsx';
import { ReactNode } from 'react';

import './style.scss';

interface TopBarProps {
	leftElement?: ReactNode;
	rightElement?: ReactNode;
	logo?: ReactNode;
	/**
	 * Hide the WordPress wordmark when `compactLogo` is set.
	 * Always show the WordPress logo instead.
	 * - This is critical for current Login views, where the logo (WordPressLogo) is always visible
	 * - Confirm with Design before changing functionality around this
	 */
	compactLogo?: 'always';
}

export const TopBar = ( { leftElement, rightElement, logo, compactLogo }: TopBarProps ) => {
	const defaultLogo = (
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
