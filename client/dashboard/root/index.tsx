import { Outlet } from '@tanstack/react-router';
import CommandPalette from '../command-palette';
import Header from '../header';

import './style.scss';

function Root() {
	return (
		<div className="dashboard-root__layout">
			<Header />
			<main>
				<Outlet />
			</main>
			<CommandPalette />
		</div>
	);
}

export default Root;
