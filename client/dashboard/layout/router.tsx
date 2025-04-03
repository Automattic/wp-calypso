import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import Domains from '../domains';
import Header from '../header';
import Profile from '../profile';
import Site from '../site';
import SiteBackups from '../site-backups';
import Sites from '../sites';

function Element() {
	return (
		<div className="dashboard__layout">
			<Header />
			<main className="dashboard__content">
				<Outlet />
			</main>
		</div>
	);
}

export const router = createBrowserRouter(
	[
		{
			path: '/',
			element: <Element />,
			children: [
				{
					path: 'sites',
					element: <Sites />,
				},
				{
					path: 'sites/:id',
					element: <Site />,
				},
				{
					path: 'sites/:id/backups',
					element: <SiteBackups />,
				},
				{
					path: 'domains',
					element: <Domains />,
				},
				{
					path: 'me/profile',
					element: <Profile />,
					loader: Profile.loader,
				},
				{
					path: '',
					element: <Navigate to="/sites" replace />,
				},
			],
		},
	],
	{
		basename: '/v2',
	}
);
