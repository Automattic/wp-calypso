import clsx from 'clsx';
import { forwardRef } from 'react';

import './style.scss';

const FormSettingExplanation = forwardRef<
	HTMLParagraphElement,
	{ children: React.ReactNode; className?: string; isIndented?: boolean }
>( ( { children, className = '', isIndented = false }, forwardedRef ) => {
	return (
		<p
			className={ clsx( 'form-setting-explanation', className, {
				'is-indented': isIndented,
			} ) }
			ref={ forwardedRef }
		>
			{ children }
		</p>
	);
} );

export default FormSettingExplanation;
