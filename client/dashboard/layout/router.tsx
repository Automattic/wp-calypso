import { __ } from '@wordpress/i18n';
import { createBrowserRouter, Navigate, Outlet, ActionFunctionArgs, json } from 'react-router-dom';
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
import SiteOverview from '../site-overview';
import Sites from '../sites';

async function profileAction( { request }: ActionFunctionArgs ) {
	const profileData = await request.json();
	try {
		await updateProfile( profileData as ProfileObject );
		return json( { ok: true } );
	} catch ( error ) {
		return json(
			{
				ok: false,
				error: __( 'Failed to update profile' ),
			},
			{ status: 400 }
		);
	}
}

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
					id: 'site',
					path: 'sites/:id',
					element: <Site />,
					loader: ( { params } ) => fetchSite( params.id as string ),
					children: [
						{
							path: '',
							element: <SiteOverview />,
						},
						{
							path: 'backups',
							element: <SiteBackups />,
						},
					],
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
					action: profileAction,
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
