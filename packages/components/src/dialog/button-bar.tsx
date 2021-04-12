/**
 * External dependencies
 */
import React, { isValidElement, cloneElement } from 'react';
import type { ReactElement, ReactNode, FunctionComponent } from 'react';
import classnames from 'classnames';

export type BaseButton = {
	action: string;
	disabled?: boolean;
	label: ReactNode;
	className?: string;
	additionalClassNames?: string;
	isPrimary?: boolean;
	onClick?: ( closeDialog: () => void ) => void;
};

export type Button = ReactElement | BaseButton;

type Props = {
	buttons?: Button[];
	baseClassName: string;
	onButtonClick: ( button: BaseButton ) => void;
};

const ButtonBar: FunctionComponent< Props > = ( { buttons, baseClassName, onButtonClick } ) => {
	if ( ! buttons ) {
		return null;
	}

	return (
		<div className={ baseClassName + '__action-buttons' }>
			{ buttons.map( ( button, index ) => {
				const key = index;

				if ( isValidElement( button ) ) {
					return cloneElement( button, { key } );
				}

				const classes = classnames( button.className || 'button', button.additionalClassNames, {
					'is-primary': button.isPrimary || buttons.length === 1,
				} );

				return (
					<button
						key={ key }
						className={ classes }
						data-e2e-button={ button.action }
						data-tip-target={ `dialog-base-action-${ button.action }` }
						onClick={ () => onButtonClick( button ) }
						disabled={ !! button.disabled }
					>
						<span className={ baseClassName + '__button-label' }>{ button.label }</span>
					</button>
				);
			} ) }
		</div>
	);
};

export default ButtonBar;
