import { ReactNode } from 'react';

import './style.scss';

type Props = {
	label: string;
	description?: string;
	children: ReactNode;
};

export default function FormField( { label, children, description }: Props ) {
	return (
		<div className="a4a-form__section-field">
			<h3 className="a4a-form__section-field-label">{ label }</h3>

			{ children }

			{ description && <p className="a4a-form__section-field-description">{ description }</p> }
		</div>
	);
}
