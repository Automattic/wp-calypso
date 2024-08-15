import clsx from 'clsx';
import type { HTMLProps, ReactNode } from 'react';

import './style.scss';

const FormRadio = ( {
	className,
	label,
	...otherProps
}: {
	className?: string;
	label?: ReactNode;
} & Omit< HTMLProps< HTMLInputElement >, 'label' > ) => (
	<>
		<input { ...otherProps } type="radio" className={ clsx( className, 'form-radio' ) } />
		{ label && (
			<label className="form-radio__label" htmlFor={ otherProps?.id }>
				{ label }
			</label>
		) }
	</>
);

export default FormRadio;
