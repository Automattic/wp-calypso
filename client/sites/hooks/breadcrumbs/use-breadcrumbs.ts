import { useRemoveDuplicateViewsExperimentEnabled } from 'calypso/lib/remove-duplicate-views-experiment';
import { useSelector } from 'calypso/state';
import { getBreadcrumbs } from 'calypso/state/breadcrumb/selectors';

export function useBreadcrumbs() {
	const breadcrumbs = useSelector( getBreadcrumbs );
	const isRemoveDuplicateViewsExperimentEnabled = useRemoveDuplicateViewsExperimentEnabled();

	const shouldShowBreadcrumbs = isRemoveDuplicateViewsExperimentEnabled && breadcrumbs.length >= 3;

	return {
		// In sites dashboard, the components are rendered from the innermost level,
		// and so the breadcrumb items are added in reversed order.
		// Here we reverse them again so that they are shown in the correct order.
		breadcrumbs: [ ...breadcrumbs ].reverse(),
		shouldShowBreadcrumbs,
	};
}
