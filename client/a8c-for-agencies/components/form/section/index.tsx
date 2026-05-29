import { Card } from '@wordpress/components';
import clsx from 'clsx';
import { ReactNode } from 'react';

import './style.scss';

type Props = {
	title?: string;
	description?: string;
	children: ReactNode;
	className?: string;
};

export default function FormSection( { title, description, children, className }: Props ) {
	return (
		<Card className={ clsx( 'a4a-form__section', className ) } isRounded={ false }>
			<div className="a4a-form__section-heading">
				<h2 className="a4a-form__section-heading-title">{ title }</h2>
				{ description && <p className="a4a-form__section-heading-description">{ description }</p> }
			</div>

			<div className="a4a-form__section-body">{ children }</div>
		</Card>
	);
}
