import { WordPressLogo } from '@automattic/components';
import { useIsFetching } from '@tanstack/react-query';
import { CatchNotFound, Outlet, useRouterState } from '@tanstack/react-router';
import { LoadingLine } from '../../components/loading-line';
import NotFound from '../404';
import CommandPalette from '../command-palette';
import { useAppContext } from '../context';
import Header from '../header';
import Snackbars from '../snackbars';
import './style.scss';

function Root() {
	const { LoadingLogo = WordPressLogo } = useAppContext();
	const isFetching = useIsFetching();
	const router = useRouterState();
	const isNavigating = router.status === 'pending';
	// A little trick after investigation router state: it will initially be
	// empty, but remain set after subsequent navigations.
	// https://tanstack.com/router/latest/docs/framework/react/api/router/RouterStateType#resolvedlocation-property
	const isInitialLoad = ! router.resolvedLocation;

	return (
		<div className="dashboard-root__layout">
			{ ( isFetching > 0 || isNavigating ) && <LoadingLine /> }
			{ isInitialLoad && <LoadingLogo className="wpcom-site__logo" /> }
			<Header />
			<main>
				<CatchNotFound fallback={ NotFound }>
					<Outlet />
				</CatchNotFound>
			</main>
			<CommandPalette />
			<Snackbars />
		</div>
	);
}

export default Root;
