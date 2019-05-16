/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormCheckbox from 'components/forms/form-checkbox';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import SupportInfo from 'components/support-info';

const ContractorSelect = ( { checked, onChange } ) => {
	const translate = useTranslate();

	return (
		<FormFieldset>
			<FormLabel>
				<FormCheckbox onChange={ onChange } checked={ checked } />
				<span>
					{ translate( 'This user is a freelancer, consultant, or agency.' ) }
					<SupportInfo
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
