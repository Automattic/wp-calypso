import { LoadingPlaceholder } from '@automattic/components';

export const Skeleton = () => {
	return (
		<div className="site-logs-table__skeleton">
			<LoadingPlaceholder className="site-logs-table__skeleton-table-row" />

			<LoadingPlaceholder className="site-logs-table__skeleton-table-row" />
			<LoadingPlaceholder className="site-logs-table__skeleton-table-row" />
			<LoadingPlaceholder className="site-logs-table__skeleton-table-row" />
			<LoadingPlaceholder className="site-logs-table__skeleton-table-row" />
			<LoadingPlaceholder className="site-logs-table__skeleton-table-row" />
			<LoadingPlaceholder className="site-logs-table__skeleton-table-row" />
			<LoadingPlaceholder className="site-logs-table__skeleton-table-row" />
			<LoadingPlaceholder className="site-logs-table__skeleton-table-row" />
			<LoadingPlaceholder className="site-logs-table__skeleton-table-row" />
			<LoadingPlaceholder className="site-logs-table__skeleton-table-row" />
		</div>
	);
};
