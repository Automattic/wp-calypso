import { useDomainsTable } from '../domains-table/domains-table';
import { DomainsTablePlaceholder } from '../domains-table/domains-table-placeholder';

export default function DomainsTableHeaderLoading() {
	const { canSelectAnyDomains, domainsTableColumns } = useDomainsTable();

	return (
		<tr className="domains-table-header-loading-placeholder">
			{ canSelectAnyDomains && (
				<th className="domains-table-header-loading-placeholder-checkbox-column">
					<DomainsTablePlaceholder isHeader delayMS={ 50 } />
				</th>
			) }
			<th>
				<DomainsTablePlaceholder isHeader delayMS={ 50 } />
			</th>
			{ domainsTableColumns.some( ( column ) => column.name === 'owner' ) && (
				<th>
					<DomainsTablePlaceholder isHeader delayMS={ 50 } />
				</th>
			) }
			<th>
				<DomainsTablePlaceholder isHeader delayMS={ 50 } />
			</th>
			<th>
				<DomainsTablePlaceholder isHeader delayMS={ 50 } />
			</th>
			<th>
				<DomainsTablePlaceholder isHeader delayMS={ 50 } />
			</th>
			<th>
				<DomainsTablePlaceholder isHeader delayMS={ 50 } />
			</th>
		</tr>
	);
}
