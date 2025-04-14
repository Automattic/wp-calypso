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

	return (
		<div className="dashboard-root__layout">
			{ ( isFetching > 0 || isNavigating ) && <LoadingLine /> }
			{ ! router.state.resolvedLocation && <WordPressLogo className="wpcom-site__logo" /> }
			<Header />
			<main>
				<Outlet />
			</main>
			<CommandPalette />
		</div>
	);
}

export default Root;
