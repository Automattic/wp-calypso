import config from '@automattic/calypso-config';
import { useRemoveDuplicateViewsExperimentEnabled } from 'calypso/lib/remove-duplicate-views-experiment';
import { useSelector } from 'calypso/state';
import { getBreadcrumbs } from 'calypso/state/breadcrumb/selectors';

export default function useBreadcrumbs() {
	const breadcrumbs = useSelector( getBreadcrumbs );
	const isRemoveDuplicateViewsExperimentEnabled = useRemoveDuplicateViewsExperimentEnabled();

	const shouldShowBreadcrumbs =
		isRemoveDuplicateViewsExperimentEnabled &&
		config.isEnabled( 'untangling/settings-i2' ) &&
		breadcrumbs.length >= 3;

	return {
		// In sites dashboard, the components are rendered from the innermost level,
		// and so the breadcrumb items are added in reversed order.
		// Here we reverse them again so that they are shown in the correct order.
		breadcrumbs: [ ...breadcrumbs ].reverse(),
		shouldShowBreadcrumbs,
	};
}
