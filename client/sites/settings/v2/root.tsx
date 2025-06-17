import { useIsFetching } from '@tanstack/react-query';
import { Outlet, useRouterState } from '@tanstack/react-router';
import Snackbars from 'calypso/dashboard/app/snackbars';
import { LoadingLine } from 'calypso/dashboard/components/loading-line';
import { PageViewTracker } from 'calypso/dashboard/components/page-view-tracker';
import './style.scss';

export default function Root() {
	const isFetching = useIsFetching();
	const router = useRouterState();
	const isNavigating = router.status === 'pending';

	return (
		<>
			{ ( isFetching > 0 || isNavigating ) && <LoadingLine /> }
			<Outlet />
			<Snackbars />
			<PageViewTracker />
		</>
	);
}
