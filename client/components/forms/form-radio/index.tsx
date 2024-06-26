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
		{ label && <span className="form-radio__label">{ label }</span> }
	</>
);

export default FormRadio;
