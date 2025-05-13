import clsx from 'clsx';
import { ReactNode } from 'react';

import './style.scss';

type Props = {
	logo?: ReactNode;
	title?: string;
	description?: string | ReactNode;
	children: ReactNode;
	autocomplete?: 'on' | 'off';
	className?: string;
};

export default function Form( {
	className,
	title,
	description,
	children,
	autocomplete,
	logo,
}: Props ) {
	return (
		<form className={ clsx( 'a4a-form', className ) } autoComplete={ autocomplete }>
			{ logo && <div className="a4a-form__logo">{ logo }</div> }
			{ autocomplete === 'off' && (
				<input autoComplete="off" name="hidden" style={ { display: 'none' } } />
			) }
			<div className="a4a-form__heading">
				{ title && <h1 className="a4a-form__heading-title">{ title }</h1> }
				{ description && <p className="a4a-form__heading-description">{ description }</p> }
			</div>
			{ children }
		</form>
	);
}
