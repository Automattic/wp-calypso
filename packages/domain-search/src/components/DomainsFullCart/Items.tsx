import { useDomainSearch } from '../DomainSearch/DomainSearch';

export const DomainsFullCartItems = () => {
	const { selectedDomains } = useDomainSearch();

	return (
		<ul>
			{ selectedDomains.map( ( domain ) => (
				<li key={ domain }>{ domain }</li>
			) ) }
		</ul>
	);
};
