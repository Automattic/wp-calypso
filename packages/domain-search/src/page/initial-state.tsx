import { SearchForm } from '../components/search-form';
import { DomainSearchAlreadyOwnDomainCTA } from '../ui';
import { useDomainSearch } from './context';

export const InitialState = () => {
	const {
		events: { onExternalDomainClick },
		config,
	} = useDomainSearch();

	return (
		<div className="domain-search--initial-state">
			<SearchForm />
			{ config.allowsUsingOwnDomain && onExternalDomainClick && (
				<div className="domain-search--initial-state__already-own-domain-cta">
					<DomainSearchAlreadyOwnDomainCTA onClick={ () => onExternalDomainClick() } />
				</div>
			) }
		</div>
	);
};
