import { LoadingPlaceholder } from '@automattic/components';
import { useDomainsTable } from './domains-table';

export default function DomainsTableRowLoading() {
	const { hideOwnerColumn } = useDomainsTable();
	return (
		<tr className="domains-table-row-loading-placeholder">
			<td className="domains-table-row-loading-placeholder-checkbox-column">
				<LoadingPlaceholder delayMS={ 50 } />
			</td>
			<td className="domains-table-row-loading-placeholder-domain-column">
				<LoadingPlaceholder delayMS={ 50 } />
			</td>
			{ hideOwnerColumn && (
				<td className="domains-table-row-loading-placeholder-owner-column">
					<LoadingPlaceholder delayMS={ 50 } />
				</td>
			) }
			<td className="domains-table-row-loading-placeholder-site-column">
				<LoadingPlaceholder delayMS={ 50 } />
			</td>
			<td className="domains-table-row-loading-placeholder-expires-column">
				<LoadingPlaceholder delayMS={ 50 } />
			</td>
			<td className="domains-table-row-loading-placeholder-status-column">
				<LoadingPlaceholder delayMS={ 50 } />
			</td>
			<td className="domains-table-row-loading-placeholder-action-column">
				<LoadingPlaceholder delayMS={ 50 } />
			</td>
		</tr>
	);
}
