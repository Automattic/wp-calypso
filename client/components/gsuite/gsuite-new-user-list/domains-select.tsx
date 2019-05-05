/** @format */

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

const DomainsSelect = ( { domains, onChange, value }: Props ) => {
	return (
		<FormSelect value={ value } onChange={ onChange }>
			{ domains.map( domain => {
				return (
					<option value={ domain } key={ domain }>
						@{ domain }
					</option>
				);
			} ) }
		</FormSelect>
	);
};

export default DomainsSelect;
