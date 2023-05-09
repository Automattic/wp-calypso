import classnames from 'classnames';
import { isValidElement, cloneElement } from 'react';
import Button from '../button';
import type { ReactElement, ReactNode, FunctionComponent } from 'react';

export type BaseButton = {
	action: string;
	disabled?: boolean;
	label: ReactNode;
	className?: string;
	additionalClassNames?: string;
	isPrimary?: boolean;
	onClick?: ( closeDialog: () => void ) => void;
	href?: string;
	target?: string;
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

				const classes = classnames( button.className, button.additionalClassNames, {
					'is-primary': button.isPrimary || buttons.length === 1,
				} );

				return (
					<Button
						key={ key }
						className={ classes }
						data-e2e-button={ button.action }
						data-tip-target={ `dialog-base-action-${ button.action }` }
						onClick={ () => onButtonClick( button ) }
						disabled={ !! button.disabled }
						href={ button.href }
						target={ button.target }
					>
						<span className={ baseClassName + '__button-label' }>{ button.label }</span>
					</Button>
				);
			} ) }
		</div>
	);
};

export default ButtonBar;
