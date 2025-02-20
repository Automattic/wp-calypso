import { useSelector } from 'calypso/state';
import { getBreadcrumbs } from 'calypso/state/breadcrumb/selectors';

export default function useBreadcrumbs() {
	const breadcrumbs = useSelector( getBreadcrumbs );

	return {
		// In sites dashboard, the components are rendered from the innermost level,
		// and so the breadcrumb items are added in reversed order.
		// Here we reverse them again so that they are shown in the correct order.
		breadcrumbs: [ ...breadcrumbs ].reverse(),
		shouldShowBreadcrumbs: breadcrumbs.length >= 3,
	};
}
