/**
 * External dependencies
 */
import * as React from 'react';
import classnames from 'classnames';
import { Button } from '@wordpress/components';
import { useI18n } from '@automattic/react-i18n';

/**
 * Style dependencies
 */
import './style.scss';

// TODO: I would rather if this is sticky: true/false/null. When null, it sticks when breakpoint is small.
interface ActionButtonsProps {
	className?: string;
	stickyBreakpoint?: string;
}

const ActionButtons: React.FunctionComponent< ActionButtonsProps > = ( {
	className,
	children,
	stickyBreakpoint = 'small',
} ) => (
	<div className={ classnames( 'action-buttons', className, `stick-${ stickyBreakpoint }` ) }>
		{ children }
	</div>
);

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
				__( 'Go back' ) }
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
				__( 'Continue' ) }
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
				__( 'Skip for now' ) }
		</Button>
	);
};
