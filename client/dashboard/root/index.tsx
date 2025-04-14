import { useIsFetching } from '@tanstack/react-query';
import { Outlet, useRouter } from '@tanstack/react-router';
import WordPressLogo from 'calypso/components/wordpress-logo';
import CommandPalette from '../command-palette';
import Header from '../header';
import { LoadingLine } from '../loading-line';

import './style.scss';

function Root() {
	const isFetching = useIsFetching();
	const router = useRouter();
	const isNavigating = router.state.status === 'pending';
	// A little trick after investigation router.state: it will initially be
	// empty, but remain set after subsequent navigations.
	// https://tanstack.com/router/latest/docs/framework/react/api/router/RouterStateType#resolvedlocation-property
	const isInitialLoad = ! router.state.resolvedLocation;

	return (
		<div className="dashboard-root__layout">
			{ ( isFetching > 0 || isNavigating ) && <LoadingLine /> }
			{ isInitialLoad && <WordPressLogo className="wpcom-site__logo" /> }
			<Header />
			{ /* There's an issue with Tanstack Router where it renders content
			     before triggering a re-render through useRouter. */ }
			<main style={ { opacity: isInitialLoad ? 0 : 1 } }>
				<Outlet />
			</main>
			<CommandPalette />
		</div>
	);
}

export default Root;
