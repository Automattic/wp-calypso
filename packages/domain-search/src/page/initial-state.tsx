import { SearchForm } from '../components/search-form';
import { NamePulseSearchInput } from '../name-pulse';
import { DomainSearchAlreadyHaveSiteCTA, DomainSearchAlreadyOwnDomainCTA } from '../ui';
import { useDomainSearch } from './context';

export const InitialState = () => {
	const {
		events: { onExternalDomainClick, onMigrateSiteClick },
		config,
	} = useDomainSearch();

	const showAlreadyOwnDomainCTA = config.allowsUsingOwnDomain && !! onExternalDomainClick;

	return (
		<div className="domain-search--initial-state">
			{ config.showNamePulseSearch ? <NamePulseSearchInput /> : <SearchForm /> }
			{ ( showAlreadyOwnDomainCTA || onMigrateSiteClick ) && (
				<div className="domain-search--initial-state__ctas">
					{ showAlreadyOwnDomainCTA && (
						<div className="domain-search--initial-state__already-own-domain-cta">
							<DomainSearchAlreadyOwnDomainCTA onClick={ () => onExternalDomainClick() } />
						</div>
					) }
					{ onMigrateSiteClick && (
						<div className="domain-search--initial-state__already-have-site-cta">
							<DomainSearchAlreadyHaveSiteCTA onClick={ onMigrateSiteClick } />
						</div>
					) }
				</div>
			) }
		</div>
	);
};
