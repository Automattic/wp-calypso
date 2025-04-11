import { Outlet } from '@tanstack/react-router';
import Header from '../header';
import './style.scss';

function Root() {
	return (
		<div className="dashboard-root__layout">
			<Header />
			<main>
				<Outlet />
			</main>
		</div>
	);
}

export default Root;
