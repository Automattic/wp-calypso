import { Outlet } from '@tanstack/react-router';
import DashboardCommandPalette from '../command-palette';
import Header from '../header';
import './style.scss';

function Root() {
	return (
		<div className="dashboard-root__layout">
			<Header />
			<main>
				<Outlet />
			</main>
			<DashboardCommandPalette />
		</div>
	);
}

export default Root;
