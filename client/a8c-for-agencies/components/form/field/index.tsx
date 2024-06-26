import { useTranslate } from 'i18n-calypso';
import { ReactNode } from 'react';

import './style.scss';

type Props = {
	label: string;
	sub?: string;
	description?: string;
	showOptionalLabel?: boolean;
	validationText?: string;
	children: ReactNode;
	isRequired?: boolean;
};

export default function FormField( {
	label,
	sub,
	children,
	description,
	showOptionalLabel,
	isRequired,
	validationText,
}: Props ) {
	const translate = useTranslate();

	return (
		<div className="a4a-form__section-field">
			<div className="a4a-form__section-field-heading">
				<h3 className="a4a-form__section-field-label">
					{ label } { isRequired && <span className="a4a-form__section-field-required">*</span> }
					{ ! isRequired && showOptionalLabel && (
						<span className="a4a-form__section-field-optional">({ translate( 'optional' ) })</span>
					) }
					{ validationText && (
						<span className="a4a-form__section-field-validation">( { validationText } )</span>
					) }
				</h3>
				{ sub && <p className="a4a-form__section-field-sub">{ sub }</p> }
			</div>

			{ children }

			{ description && <p className="a4a-form__section-field-description">{ description }</p> }
		</div>
	);
}
