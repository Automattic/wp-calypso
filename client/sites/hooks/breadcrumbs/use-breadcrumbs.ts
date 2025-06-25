import { Item as BreadcrumbItem } from 'calypso/components/breadcrumb';
import { useSelector } from 'calypso/state';
import { getBreadcrumbs } from 'calypso/state/breadcrumb/selectors';

export function useBreadcrumbs() {
	const breadcrumbs = useSelector( getBreadcrumbs );

	const shouldShowBreadcrumbs = breadcrumbs.some(
		( item: BreadcrumbItem ) => item.id === 'feature'
	);

	return {
		// In sites dashboard, the components are rendered from the innermost level,
		// and so the breadcrumb items are added in reversed order.
		// Here we reverse them again so that they are shown in the correct order.
		breadcrumbs: [ ...breadcrumbs ].reverse(),
		shouldShowBreadcrumbs,
	};
}
