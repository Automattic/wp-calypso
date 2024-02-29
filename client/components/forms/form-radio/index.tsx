import classnames from 'classnames';
import type { HTMLProps, ReactNode } from 'react';

import './style.scss';

const FormRadio = ( {
	className,
	label,
	...otherProps
}: {
	className?: string;
	label?: ReactNode;
} & HTMLProps< HTMLInputElement > ) => (
	<>
		<input { ...otherProps } type="radio" className={ classnames( className, 'form-radio' ) } />
		{ label && <span className="form-radio__label">{ label }</span> }
	</>
);

export default FormRadio;
