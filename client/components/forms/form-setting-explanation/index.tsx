import clsx from 'clsx';
import { forwardRef } from 'react';

import './style.scss';

const FormSettingExplanation = forwardRef<
	HTMLParagraphElement,
	{ children: React.ReactNode; className?: string; noValidate?: boolean; isIndented?: boolean }
>( ( { className = '', noValidate = false, isIndented = false, ...rest }, forwardedRef ) => {
	const classes = clsx( 'form-setting-explanation', className, {
		'no-validate': noValidate,
		'is-indented': isIndented,
	} );

	return <p { ...rest } className={ classes } ref={ forwardedRef } />;
} );

export default FormSettingExplanation;
