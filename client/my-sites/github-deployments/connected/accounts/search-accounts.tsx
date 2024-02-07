import { __ } from '@wordpress/i18n';
import { ChangeEvent } from 'react';
import FormTextInput from 'calypso/components/forms/form-text-input/index';

interface SearchAccountsProps {
	value: string;
	onChange( query: string ): void;
}

export const SearchAccounts = ( { value, onChange }: SearchAccountsProps ) => {
	return (
		<FormTextInput
			className="github-deployments-search-accounts"
			type="string"
			onChange={ ( event: ChangeEvent< HTMLInputElement > ) =>
				onChange( event.currentTarget.value )
			}
			value={ value }
			placeholder={ __( 'Search accounts' ) }
		/>
	);
};
