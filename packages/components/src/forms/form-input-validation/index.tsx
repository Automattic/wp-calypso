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
	icon?: string;
	id?: string;
	className?: string;
	children?: ReactNode;
}

const FormInputValidation: React.FC< Props > = ( {
	isError = false,
	isWarning,
	isHidden,
	className,
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
		<div className={ classes } role="alert">
			<span id={ id }>
				{ icon ? (
					<Gridicon size={ 24 } icon={ icon } />
				) : (
					<Icon size={ 24 } icon={ defaultIcon } />
				) }
				{ text }
				{ children }
			</span>
		</div>
	);
};

export default FormInputValidation;
