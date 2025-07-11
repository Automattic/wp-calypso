import { TextControl } from '@wordpress/components';
import { useDomainSearch } from '../domain-search';

export const DomainSearchControlsInput = ( {
	onChange,
	value,
}: {
	onChange?: ( value: string ) => void;
	value?: string;
} ) => {
	const { query, setQuery } = useDomainSearch();

	return <TextControl onChange={ onChange ?? setQuery } value={ value ?? query } />;
};
