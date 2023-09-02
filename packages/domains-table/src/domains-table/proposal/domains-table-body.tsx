import { getDomainId } from '../../get-domain-id';
import { DomainsTableRow } from '../domains-table-row';
import { useDomainsTable } from './domains-table';

import '../style.scss';

export function DomainsTableBody() {
	const {
		selectedDomains,
		filteredData,
		hideOwnerColumn,
		handleSelectDomain,
		isAllSitesView,
		fetchSiteDomains,
		domainStatusPurchaseActions,
		onDomainsRequiringAttentionChange,
		fetchSite,
	} = useDomainsTable();

	return (
		<tbody>
			{ filteredData.map( ( domain ) => (
				<DomainsTableRow
					key={ getDomainId( domain ) }
					domain={ domain }
					isSelected={ selectedDomains.has( getDomainId( domain ) ) }
					onSelect={ handleSelectDomain }
					fetchSiteDomains={ fetchSiteDomains }
					fetchSite={ fetchSite }
					isAllSitesView={ isAllSitesView }
					domainStatusPurchaseActions={ domainStatusPurchaseActions }
					hideOwnerColumn={ hideOwnerColumn }
					onDomainsRequiringAttentionChange={ onDomainsRequiringAttentionChange }
				/>
			) ) }
		</tbody>
	);
}
