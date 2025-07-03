import { SearchControl } from '@wordpress/components';
import { useDomainSearch } from '../DomainSearch/DomainSearch';

export const DomainSearchControlsInput = ( {
	onChange,
	value,
}: {
	onChange?: ( value: string ) => void;
	value?: string;
} ) => {
	const { query, setQuery } = useDomainSearch();

	return (
		<SearchControl
			className="domain-search-controls__input"
			__nextHasNoMarginBottom
			value={ value ?? query }
			placeholder="discardedobject.art"
			onChange={ onChange ?? setQuery }
		/>
	);
};
