import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { updateProfile, fetchProfile, fetchSite, fetchSites, type ProfileObject } from '../data';
import Domains from '../domains';
import Header from '../header';
import Billing from '../me/billing';
import MeNotifications from '../me/notifications';
import Privacy from '../me/privacy';
import Security from '../me/security';
import Profile from '../profile';
import Reader from '../reader';
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
					loader: fetchSites,
				},
				{
					path: 'sites/:id',
					element: <Site />,
					loader: ( { params } ) => fetchSite( params.id as string ),
				},
				{
					path: 'sites/:id/backups',
					element: <SiteBackups />,
				},
				{
					path: 'domains',
					element: <Domains />,
					loader: Domains.loader,
				},
				{
					path: 'me/profile',
					element: <Profile />,
					loader: fetchProfile,
					action: async ( { request } ) => {
						const data = await request.json();
						return await updateProfile( data as ProfileObject );
					},
				},
				{
					path: 'me/billing',
					element: <Billing />,
				},
				{
					path: 'me/security',
					element: <Security />,
				},
				{
					path: 'me/privacy',
					element: <Privacy />,
				},
				{
					path: 'me/notifications',
					element: <MeNotifications />,
				},
				{
					path: 'reader',
					element: <Reader />,
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
