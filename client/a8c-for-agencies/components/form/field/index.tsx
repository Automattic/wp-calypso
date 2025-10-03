import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { ReactNode } from 'react';
import withErrorHandling from '../hoc/with-error-handling';

import './style.scss';

type Props = {
	label: string;
	labelFor?: string;
	sub?: string;
	description?: string | ReactNode;
	showOptionalLabel?: boolean;
	children: ReactNode;
	isRequired?: boolean;
	error?: string;
};

function FormField( {
	label,
	labelFor,
	sub,
	children,
	description,
	showOptionalLabel,
	isRequired,
	error,
}: Props ) {
	const translate = useTranslate();

	return (
		<div className="a4a-form__section-field">
			<div className="a4a-form__section-field-heading">
				<label className="a4a-form__section-field-label" htmlFor={ labelFor }>
					{ label } { isRequired && <span className="a4a-form__section-field-required">*</span> }
					{ ! isRequired && showOptionalLabel && (
						<span className="a4a-form__section-field-optional">({ translate( 'optional' ) })</span>
					) }
				</label>
				{ sub && <p className="a4a-form__section-field-sub">{ sub }</p> }
			</div>

			<div
				className={ clsx( 'a4a-form__content-wrapper', {
					'is-error': !! error,
				} ) }
			>
				{ children }
			</div>

			<div
				className={ clsx( 'a4a-form__error', {
					hidden: ! error,
				} ) }
				role="alert"
			>
				{ error }
			</div>

			{ description && <p className="a4a-form__section-field-description">{ description }</p> }
		</div>
	);
}

export default withErrorHandling( FormField );
