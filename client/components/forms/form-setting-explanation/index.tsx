import clsx from 'clsx';
import { forwardRef } from 'react';

import './style.scss';

const FormSettingExplanation = forwardRef<
	HTMLParagraphElement,
>( ( { className = '', isIndented = false, ...rest }, forwardedRef ) => {
	{ children: React.ReactNode; className?: string; isIndented?: boolean }
	const classes = clsx( 'form-setting-explanation', className, {
		'is-indented': isIndented,
	} );

	return <p { ...rest } className={ classes } ref={ forwardedRef } />;
} );

export default FormSettingExplanation;
