import { Button } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import * as React from 'react';

import './style.scss';

interface ActionButtonsProps {
	className?: string;
	sticky?: boolean | null;
	children?: React.ReactNode;
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
	if ( sticky === true ) {
		stickyClass = 'is-sticky';
	}
	if ( sticky === false ) {
		stickyClass = 'no-sticky';
	}

	return <div className={ clsx( 'action-buttons', className, stickyClass ) }>{ children }</div>;
};

export default ActionButtons;

export const BackButton: React.FunctionComponent< React.ComponentProps< typeof Button > > = ( {
	className,
	children,
	...buttonProps
} ) => {
	const { __ } = useI18n();

	return (
		<Button
			className={ clsx( 'action_buttons__button action-buttons__back', className ) }
			variant="link"
			{ ...buttonProps }
		>
			{ children ||
				/* translators: Button label for going to previous step in onboarding */
				__( 'Go back', __i18n_text_domain__ ) }
		</Button>
	);
};

export const NextButton: React.FunctionComponent< React.ComponentProps< typeof Button > > = ( {
	className,
	children,
	...buttonProps
} ) => {
	const { __ } = useI18n();

	return (
		<Button
			className={ clsx( 'button action_buttons__button action-buttons__next', className ) }
			variant="primary"
			{ ...buttonProps }
		>
			{ children ||
				/* translators: Button label for advancing to next step in onboarding */
				__( 'Continue', __i18n_text_domain__ ) }
		</Button>
	);
};
