import { ChangeEvent } from 'react';
import FormSelect from 'calypso/components/forms/form-select';

interface Props {
	domains: string[];
	onChange: ( event: ChangeEvent< HTMLInputElement > ) => void;
	value: string;
}

const ProviderFormDomainsSelect = ( { domains, onChange, value }: Props ) => {
	return (
		<FormSelect className="domains-select__domain-select" onChange={ onChange } value={ value }>
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

export default ProviderFormDomainsSelect;
