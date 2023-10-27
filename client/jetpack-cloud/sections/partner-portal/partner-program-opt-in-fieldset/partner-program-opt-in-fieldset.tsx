import { Icon, info } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { ChangeEvent } from 'react';
import FormInputCheckbox from 'calypso/components/forms/form-checkbox';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';

import './style.scss';

interface Props {
	setPartnerProgramOptIn: ( partnerProgramOptIn: boolean ) => void;
	isChecked: boolean;
}

export default function PartnerProgramOptInFieldset( {
	setPartnerProgramOptIn,
	isChecked,
}: Props ) {
	const translate = useTranslate();


	return (
		<FormFieldset className="partner-program-opt-in-field">
			<FormLabel>
				{ translate( 'Jetpack Agency & Pro Partner program' ) }
				<Icon
					className="partner-program-opt-in-field__info"
					size={ 16 }
					icon={ info }
				/>
			</FormLabel>
			<FormInputCheckbox
				id="partnerProgramOptIn"
				name="partnerProgramOptIn"
				checked={ isChecked }
				onChange={ ( event: ChangeEvent< HTMLInputElement > ) =>
					setPartnerProgramOptIn( event.target.checked )
				}
			/>
			<span>{ translate( 'Sign up for the Jetpack Agency & Pro Partner program' ) }</span>
		</FormFieldset>
	);
}
