import { FormLabel } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import FormCheckbox from 'calypso/components/forms/form-checkbox';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import InfoPopover from 'calypso/components/info-popover';
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
				<span>
					{ translate( 'This user is a contractor, freelancer, consultant, or agency.' ) }
					<InfoPopover position="top right" screenReaderText={ translate( 'Learn more' ) }>
						{ translate(
							'Use this checkbox to flag users who are not a part of your organization.'
						) }
					</InfoPopover>
				</span>
			</FormLabel>
		</FormFieldset>
	);
};

export default ContractorSelect;
