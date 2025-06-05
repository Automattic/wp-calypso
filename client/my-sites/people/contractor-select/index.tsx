import { FormLabel } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import FormCheckbox from 'calypso/components/forms/form-checkbox';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import type { ChangeEventHandler } from 'react';

interface Props {
	id: string;
	checked: boolean;
	onChange: ChangeEventHandler< HTMLInputElement >;
	disabled: boolean;
}

import './style.scss';

const ContractorSelect: FunctionComponent< Props > = ( { id, checked, onChange, disabled } ) => {
	const translate = useTranslate();

	return (
		<FormFieldset key={ id } className="contractor-select">
			<FormLabel>
				<FormCheckbox
					className="contractor-select__checkbox"
					onChange={ onChange }
					checked={ checked }
					disabled={ disabled }
				/>
				<span>{ translate( 'Mark as external collaborator' ) }</span>
			</FormLabel>
		</FormFieldset>
	);
};

export default ContractorSelect;
