import classNames from 'classnames';
import { ReactNode } from 'react';
import { Gridicon } from '../..';

import './style.scss';

interface Props {
	isError: boolean;
	isWarning?: boolean;
	isHidden?: boolean;
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

	const defaultIcon = isError || isWarning ? 'notice-outline' : 'checkmark';

	return (
		<div className={ classes } role="alert">
			<span id={ id }>
				<Gridicon size={ 24 } icon={ icon ? icon : defaultIcon } /> { text }
				{ children }
			</span>
		</div>
	);
};

export default FormInputValidation;
