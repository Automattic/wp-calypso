import { LoadingPlaceholder } from '@automattic/components';

export const Skeleton = ( props: { className: string } ) => {
	const { className } = props;
	return (
		<div className={ className }>
			<LoadingPlaceholder className="site-logs-table__skeleton-table-cell" />
			<LoadingPlaceholder className="site-logs-table__skeleton-table-cell" />
			<LoadingPlaceholder className="site-logs-table__skeleton-table-cell" />
			<LoadingPlaceholder className="site-logs-table__skeleton-table-cell" />
			<LoadingPlaceholder className="site-logs-table__skeleton-table-cell" />
			<LoadingPlaceholder className="site-logs-table__skeleton-table-cell" />
			<LoadingPlaceholder className="site-logs-table__skeleton-table-cell" />
			<LoadingPlaceholder className="site-logs-table__skeleton-table-cell" />
			<LoadingPlaceholder className="site-logs-table__skeleton-table-cell" />
			<LoadingPlaceholder className="site-logs-table__skeleton-table-cell" />
			<LoadingPlaceholder className="site-logs-table__skeleton-table-cell" />
			<LoadingPlaceholder className="site-logs-table__skeleton-table-cell" />
			<LoadingPlaceholder className="site-logs-table__skeleton-table-cell" />
			<LoadingPlaceholder className="site-logs-table__skeleton-table-cell" />
			<LoadingPlaceholder className="site-logs-table__skeleton-table-cell" />
			<LoadingPlaceholder className="site-logs-table__skeleton-table-cell" />
			<LoadingPlaceholder className="site-logs-table__skeleton-table-cell" />
			<LoadingPlaceholder className="site-logs-table__skeleton-table-cell" />
			<LoadingPlaceholder className="site-logs-table__skeleton-table-cell" />
			<LoadingPlaceholder className="site-logs-table__skeleton-table-cell" />
		</div>
	);
};
