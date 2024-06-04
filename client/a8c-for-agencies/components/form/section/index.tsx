import { Card } from '@wordpress/components';
import { ReactNode } from 'react';

import './style.scss';

type Props = {
	title?: string;
	description?: string;
	children: ReactNode;
};

export default function FormSection( { title, description, children }: Props ) {
	return (
		<Card className="a4a-form__section" isRounded={ false }>
			<div className="a4a-form__section-heading">
				<h2 className="a4a-form__section-heading-title">{ title }</h2>
				{ description && <p className="a4a-form__section-heading-description">{ description }</p> }
			</div>

			<div className="a4a-form__section-body">{ children }</div>
		</Card>
	);
}
