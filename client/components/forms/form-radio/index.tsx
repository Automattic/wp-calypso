import clsx from 'clsx';
import type { HTMLProps, ReactNode } from 'react';

import './style.scss';

const FormRadio = ( {
	className,
	label,
	htmlFor,
	...otherProps
}: {
	className?: string;
	label?: ReactNode;
	htmlFor?: string;
} & Omit< HTMLProps< HTMLInputElement >, 'label' > ) => (
	<>
		<input { ...otherProps } type="radio" className={ clsx( className, 'form-radio' ) } />
		{ label && ! htmlFor && <span className="form-radio__label">{ label }</span> }
		{ label && htmlFor && (
			<label className="form-radio__label" htmlFor={ htmlFor }>
				{ label }
			</label>
		) }
	</>
);

export default FormRadio;
