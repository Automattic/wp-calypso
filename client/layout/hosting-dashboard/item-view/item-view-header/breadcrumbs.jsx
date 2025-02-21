import NavigationHeader from 'calypso/components/navigation-header';
import './style.scss';

export default function ItemViewBreadcrumbsHeader( { breadcrumbs } ) {
	return (
		<div className="hosting-dashboard-item-view__header">
			<NavigationHeader
				className="hosting-dashboard-item-view__header-content hosting-dashboard-item-view__header-breadcrumbs"
				navigationItems={ breadcrumbs }
			/>
		</div>
	);
}
