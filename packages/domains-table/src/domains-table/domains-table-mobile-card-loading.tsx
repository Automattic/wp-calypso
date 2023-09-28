import { DomainsTablePlaceholder } from './domains-table-placeholder';

export default function DomainsTableMobileCardLoading() {
	return (
		<div className="domains-table-mobile-card-loading-placeholder">
			<div>
				<DomainsTablePlaceholder delayMS={ 50 } />
				<div className="domains-table-mobile-card-loading-placeholder-actions">
					<DomainsTablePlaceholder delayMS={ 50 } />
				</div>
			</div>
			<div>
				<DomainsTablePlaceholder delayMS={ 50 } />
				<DomainsTablePlaceholder delayMS={ 50 } />
			</div>
			<div>
				<DomainsTablePlaceholder delayMS={ 50 } />
				<div className="domains-table-mobile-card-loading-placeholder-status">
					<DomainsTablePlaceholder delayMS={ 50 } />
				</div>
			</div>
		</div>
	);
}
