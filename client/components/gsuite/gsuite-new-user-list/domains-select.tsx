/**
 * External dependencies
 */
import React, { ChangeEvent } from 'react';

/**
 * Internal dependencies
 */
import FormSelect from 'components/forms/form-select';

interface Props {
	domains: string[];
	onChange: ( event: ChangeEvent< HTMLInputElement > ) => void;
	value: string;
}

const GSuiteDomainsSelect = ( { domains, onChange, value }: Props ) => {
	return (
		<FormSelect
			className="gsuite-new-user-list__domain-select"
			onChange={ onChange }
			value={ value }
		>
			{ domains.map( ( domain ) => {
				return (
					<option value={ domain } key={ domain }>
						@{ domain }
					</option>
				);
			} ) }
		</FormSelect>
	);
};

export default GSuiteDomainsSelect;
