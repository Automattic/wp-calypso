import { Button } from '@wordpress/components';
import type { ReactNode } from 'react';

export function Choice( {
	title,
	description,
	onClick,
	badge,
}: {
	title: string;
	description: string;
	onClick: () => void;
	badge?: string;
} ) {
	return (
		<Button className="agency-site-wizard__choice" onClick={ onClick }>
			<span className="agency-site-wizard__choice-heading">
				<span className="agency-site-wizard__choice-title">{ title }</span>
				{ badge && <span className="agency-site-wizard__badge">{ badge }</span> }
			</span>
			<span className="agency-site-wizard__choice-description">{ description }</span>
		</Button>
	);
}

export function RadioChoice( {
	title,
	description,
	name,
	value,
	checked,
	onChange,
	children,
	icon,
}: {
	title: string;
	description: string;
	name: string;
	value: string;
	checked: boolean;
	onChange: () => void;
	children?: ReactNode;
	icon?: ReactNode;
} ) {
	return (
		<label className="agency-site-wizard__radio-choice" data-selected={ checked }>
			<span className="agency-site-wizard__choice-heading">
				{ icon && <span aria-hidden="true">{ icon }</span> }
				<span className="agency-site-wizard__choice-title">{ title }</span>
				<input
					type="radio"
					name={ name }
					value={ value }
					checked={ checked }
					onChange={ onChange }
					aria-label={ title }
				/>
			</span>
			<span className="agency-site-wizard__choice-description">{ description }</span>
			{ children }
		</label>
	);
}
