import { Icon, info, check } from '@wordpress/icons';
import clsx from 'clsx';
import { ReactNode } from 'react';
import { Gridicon } from '../..';

import './style.scss';

interface Props {
	isError: boolean;
	isWarning?: boolean;
	isHidden?: boolean;
	isValid?: boolean;
	isMuted?: boolean;
	text: ReactNode;
	hasIcon?: boolean;
	ariaLabel?: string;
	icon?: string;
	id?: string;
	className?: string;
	children?: ReactNode;
}

const FormInputValidation: React.FC< Props > = ( {
	isError = false,
	isWarning,
	isHidden,
	isMuted,
	className,
	ariaLabel = '',
	text,
	hasIcon = true,
	icon,
	id,
	children,
} ) => {
	const classes = clsx( className, {
		'form-input-validation': true,
		'is-warning': isWarning,
		'is-error': isError,
		'is-hidden': isHidden,
		'is-muted': isMuted,
		'has-icon': hasIcon,
	} );

	const defaultIcon = isError || isWarning ? info : check;

	return (
		/* eslint-disable wpcalypso/jsx-gridicon-size */
		<div aria-label={ ariaLabel } className={ classes } role="alert">
			<span id={ id }>
				{ hasIcon &&
					( icon ? (
						<Gridicon size={ 20 } icon={ icon } />
					) : (
						<Icon size={ 20 } icon={ defaultIcon } />
					) ) }
				{ text }
				{ children }
			</span>
		</div>
	);
};

export default FormInputValidation;
