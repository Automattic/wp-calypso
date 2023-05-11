import { Icon, info, check } from '@wordpress/icons';
import classNames from 'classnames';
import { ReactNode } from 'react';
import { Gridicon } from '../..';

import './style.scss';

interface Props {
	isError: boolean;
	isWarning?: boolean;
	isHidden?: boolean;
	isValid?: boolean;
	text: ReactNode;
	ariaLabel?: string;
	icon?: string | ReactNode;
	id?: string;
	className?: string;
	children?: ReactNode;
}

const FormInputValidation: React.FC< Props > = ( {
	isError = false,
	isWarning,
	isHidden,
	className,
	ariaLabel = '',
	text,
	icon,
	id,
	children,
} ) => {
	const classes = classNames( className, {
		'form-input-validation': true,
		'is-warning': isWarning,
		'is-error': isError,
		'is-hidden': isHidden,
	} );

	const defaultIcon = isError || isWarning ? info : check;

	return (
		<div aria-label={ ariaLabel } className={ classes } role="alert">
			<span id={ id }>
				{ ! icon ? (
					<Icon size={ 24 } icon={ defaultIcon } />
				) : typeof icon === 'string' ? (
					<Gridicon size={ 24 } icon={ icon } />
				) : (
					icon
				) }
				{ text }
				{ children }
			</span>
		</div>
	);
};

export default FormInputValidation;
