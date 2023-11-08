import { useDomainsTable } from './domains-table';
import { DomainsTablePlaceholder } from './domains-table-placeholder';

export default function DomainsTableRowLoading() {
	const { canSelectAnyDomains, domainsTableColumns } = useDomainsTable();
	return (
		<tr>
			{ canSelectAnyDomains && (
				<td className="domains-table-row-loading-placeholder-checkbox-column">
					<DomainsTablePlaceholder delayMS={ 50 } />
				</td>
			) }
			<td className="domains-table-row-loading-placeholder-domain-column">
				<DomainsTablePlaceholder delayMS={ 50 } />
			</td>
			{ domainsTableColumns.some( ( column ) => column.name === 'owner' ) && (
				<td className="domains-table-row-loading-placeholder-owner-column">
					<DomainsTablePlaceholder delayMS={ 50 } />
				</td>
			) }
			<td className="domains-table-row-loading-placeholder-site-column">
				<DomainsTablePlaceholder delayMS={ 50 } />
			</td>
			<td className="domains-table-row-loading-placeholder-expires-column">
				<DomainsTablePlaceholder delayMS={ 50 } />
			</td>
			<td className="domains-table-row-loading-placeholder-status-column">
				<DomainsTablePlaceholder delayMS={ 50 } />
			</td>
			<td className="domains-table-row-loading-placeholder-action-column">
				<DomainsTablePlaceholder delayMS={ 50 } />
			</td>
		</tr>
	);
}
