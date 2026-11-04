import { Button } from '@wordpress/components';
import clsx from 'clsx';
import type { DragEventHandler, ReactNode } from 'react';

export function Choice( {
	title,
	description,
	onClick,
	badge,
	illustration,
	href,
	className,
	...buttonProps
}: {
	title: string;
	description: string;
	onClick: () => void;
	badge?: string;
	illustration?: ReactNode;
	href?: string;
	className?: string;
	disabled?: boolean;
	isBusy?: boolean;
	onDragOver?: DragEventHandler< HTMLElement >;
	onDrop?: DragEventHandler< HTMLElement >;
} ) {
	return (
		<Button
			{ ...buttonProps }
			className={ clsx( 'agency-site-wizard__choice', className ) }
			type="button"
			onClick={ onClick }
			{ ...( href ? { href, target: '_blank', rel: 'noreferrer' } : {} ) }
		>
			{ illustration }
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
