/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormCheckbox from 'calypso/components/forms/form-checkbox';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import SupportInfo from 'calypso/components/support-info';

interface Props {
	key: string;
	checked: boolean;
	onChange: ( event ) => void;
	disabled: boolean;
}

/**
 * Style dependencies
 */
import './style.scss';

const ContractorSelect: FunctionComponent< Props > = ( { key, checked, onChange, disabled } ) => {
	const translate = useTranslate();

	return (
		<FormFieldset key={ key } className="contractor-select">
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
