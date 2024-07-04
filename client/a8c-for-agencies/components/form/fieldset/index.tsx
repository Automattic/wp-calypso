import { FormLabel } from '@automattic/components';
import clsx from 'clsx';
import { ReactNode } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import './style.scss';

type Props = {
	label: string;
	error?: string;
	required?: boolean;
	description?: string;
	children?: ReactNode;
};

export default function A4AFormFieldset( {
	label,
	error,
	children,
	required,
	description,
}: Props ) {
	return (
		<FormFieldset>
			<div className="a4a-form-fieldset__header">
				<FormLabel>{ label }</FormLabel>
				{ required && <span className="a4a-form-fieldset__header-required">*</span> }
			</div>

			{ children }

			<div
				className={ clsx( 'a4a-form-fieldset__error', {
					hidden: ! error,
				} ) }
				role="alert"
			>
				{ error }
			</div>

			{ description && <p className="a4a-form-fieldset__description">{ description }</p> }
		</FormFieldset>
	);
}
