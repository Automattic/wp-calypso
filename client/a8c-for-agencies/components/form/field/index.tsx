import { ReactNode } from 'react';

import './style.scss';

type Props = {
	label: string;
	sub?: string;
	description?: string;
	children: ReactNode;
};

export default function FormField( { label, sub, children, description }: Props ) {
	return (
		<div className="a4a-form__section-field">
			<div className="a4a-form__section-field-heading">
				<h3 className="a4a-form__section-field-label">{ label }</h3>
				{ sub && <p className="a4a-form__section-field-sub">{ sub }</p> }
			</div>

			{ children }

			{ description && <p className="a4a-form__section-field-description">{ description }</p> }
		</div>
	);
}
