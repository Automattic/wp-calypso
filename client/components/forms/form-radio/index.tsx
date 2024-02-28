import classnames from 'classnames';
import type { HTMLProps } from 'react';

import './style.scss';

const FormRadio = ( {
	className,
	label,
	...otherProps
}: {
	className?: string;
	label: string;
} & HTMLProps< HTMLInputElement > ) => (
	<>
		<input { ...otherProps } type="radio" className={ classnames( className, 'form-radio' ) } />
		{ label != null && <span className="form-radio__label">{ label }</span> }
	</>
);

export default FormRadio;
