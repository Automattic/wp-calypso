import { LoadingPlaceholder } from '@automattic/components';

export default function DomainsTableMobileCardLoading() {
	return (
		<div className="domains-table-mobile-card-loading-placeholder">
			<div>
				<LoadingPlaceholder delayMS={ 50 } />
				<div className="domains-table-mobile-card-loading-placeholder-actions">
					<LoadingPlaceholder delayMS={ 50 } />
				</div>
			</div>
			<div>
				<LoadingPlaceholder delayMS={ 50 } />
				<LoadingPlaceholder delayMS={ 50 } />
			</div>
			<div>
				<LoadingPlaceholder delayMS={ 50 } />
				<div className="domains-table-mobile-card-loading-placeholder-status">
					<LoadingPlaceholder delayMS={ 50 } />
				</div>
			</div>
		</div>
	);
}
