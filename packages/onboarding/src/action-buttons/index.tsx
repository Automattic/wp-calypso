/**
 * External dependencies
 */
import * as React from 'react';
import classnames from 'classnames';
import { Button } from '@wordpress/components';
import { useI18n } from '@automattic/react-i18n';
import { Icon, chevronRight, chevronLeft } from '@wordpress/icons';

/**
 * Style dependencies
 */
import './style.scss';

interface ActionButtonsProps {
	className?: string;
	sticky?: boolean | null;
}

const ActionButtons: React.FunctionComponent< ActionButtonsProps > = ( {
	className,
	children,
	sticky = null,
} ) => {
	// if null, auto-stick (stick when small).
	// if true, always stick.
	// if false, never stick.
	let stickyClass = '';
	if ( sticky === true ) stickyClass = 'is-sticky';
	if ( sticky === false ) stickyClass = 'no-sticky';

	return (
		<div className={ classnames( 'action-buttons', className, stickyClass ) }>{ children }</div>
	);
};

export default ActionButtons;

export const BackButton: React.FunctionComponent< Button.ButtonProps > = ( {
	className,
	children,
	...buttonProps
} ) => {
	const { __ } = useI18n();

	return (
		<Button
			className={ classnames( 'action_buttons__button action-buttons__back', className ) }
			isLink
			{ ...buttonProps }
		>
			{ children ||
				/* translators: Button label for going to previous step in onboarding */
				__( 'Go back', __i18n_text_domain__ ) }
		</Button>
	);
};

export const NextButton: React.FunctionComponent< Button.ButtonProps > = ( {
	className,
	children,
	...buttonProps
} ) => {
	const { __ } = useI18n();

	return (
		<Button
			className={ classnames( 'action_buttons__button action-buttons__next', className ) }
			isPrimary
			{ ...buttonProps }
		>
			{ children ||
				/* translators: Button label for advancing to next step in onboarding */
				__( 'Continue', __i18n_text_domain__ ) }
		</Button>
	);
};

export const SkipButton: React.FunctionComponent< Button.ButtonProps > = ( {
	className,
	children,
	...buttonProps
} ) => {
	const { __ } = useI18n();

	return (
		<Button
			className={ classnames( 'action_buttons__button action-buttons__skip', className ) }
			{ ...buttonProps }
		>
			{ children ||
				/* translators: Button label for skipping a step in onboarding */
				__( 'Skip for now', __i18n_text_domain__ ) }
		</Button>
	);
};

interface ArrowButtonProps extends Button.ButtonProps {
	arrow: 'left' | 'right';
}

export const ArrowButton: React.FunctionComponent< ArrowButtonProps > = ( {
	className,
	children,
	arrow = 'right',
	...buttonProps
} ) => {
	return (
		<Button
			className={ classnames(
				`action_buttons__button action-buttons__arrow action-buttons__arrow--${ arrow }`,
				className
			) }
			{ ...buttonProps }
		>
			{ arrow === 'left' && <Icon icon={ chevronLeft } /> }
			{ children }
			{ arrow === 'right' && <Icon icon={ chevronRight } /> }
		</Button>
	);
};
