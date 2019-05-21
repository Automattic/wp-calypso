/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormCheckbox from 'components/forms/form-checkbox';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import InfoPopover from 'components/info-popover';

interface Props {
	checked: boolean;
	onChange: ( event ) => void; 
}

const ContractorSelect: FunctionComponent<Props> = ( { checked, onChange } ) => {
	const translate = useTranslate();

	return (
		<FormFieldset>
			<FormLabel>
				<FormCheckbox onChange={ onChange } checked={ checked } />
				<span>
					{ translate( 'This user is a freelancer, consultant, or agency.' ) }
					<InfoPopover position="top right">
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
