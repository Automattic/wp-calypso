import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import FormCheckbox from 'calypso/components/forms/form-checkbox';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import SupportInfo from 'calypso/components/support-info';

interface Props {
	id: string;
	checked: boolean;
	onChange: ( event ) => void;
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
				<span>
					{ translate( 'This user is a contractor, freelancer, consultant, or agency.' ) }
					<SupportInfo
						position="top right"
						text={ translate(
							'Use this checkbox to flag users who are not a part of your organization.'
						) }
					/>
				</span>
			</FormLabel>
		</FormFieldset>
	);
};

export default ContractorSelect;
