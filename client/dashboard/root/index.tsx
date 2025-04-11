import { Outlet } from '@tanstack/react-router';
import { Suspense } from '@wordpress/element';
import CommandPalette from '../command-palette';
import Header from '../header';

import './style.scss';

function Root() {
	return (
		<div className="dashboard-root__layout">
			<Header />
			<main>
				<Suspense fallback={ <div>Loading...</div> }>
					<Outlet />
				</Suspense>
			</main>
			<CommandPalette />
		</div>
	);
}

export default Root;
