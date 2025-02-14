import clsx from 'clsx';
import { isValidElement, cloneElement } from 'react';
import { Button } from '../button';
import type { ReactElement, ReactNode, FunctionComponent } from 'react';

export type BaseButton = {
	action: string;
	disabled?: boolean;
	busy?: boolean;
	scary?: boolean;
	label: ReactNode;
	className?: string;
	additionalClassNames?: string;
	isPrimary?: boolean;
	onClick?: ( closeDialog: () => void ) => void;
	href?: string;
	target?: string;
};

type Props = {
	buttons?: ( ReactElement | BaseButton )[];
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

				if ( isElement( button ) ) {
					return cloneElement( button, { key } );
				}

				const classes = clsx( button.className, button.additionalClassNames, {
					'is-primary': button.isPrimary || ( buttons.length === 1 && ! button.scary ),
				} );

				return (
					<Button
						key={ key }
						className={ classes }
						data-e2e-button={ button.action }
						data-tip-target={ `dialog-base-action-${ button.action }` }
						onClick={ () => onButtonClick( button ) }
						disabled={ !! button.disabled }
						busy={ !! button.busy }
						href={ button.href }
						target={ button.target }
						scary={ button.scary }
					>
						<span className={ baseClassName + '__button-label' }>{ button.label }</span>
					</Button>
				);
			} ) }
		</div>
	);
};

// Note: a bug in TypeScript doesn't narrow ReactElement properly, but the wrapper
// helps it work. See https://github.com/microsoft/TypeScript/issues/53178#issuecomment-1659301034
function isElement( element: ReactElement | BaseButton ): element is ReactElement {
	return isValidElement( element );
}

export default ButtonBar;
