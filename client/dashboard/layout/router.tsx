import { __ } from '@wordpress/i18n';
import { createBrowserRouter, Navigate, Outlet, ActionFunctionArgs, json } from 'react-router-dom';
import {
	updateProfile,
	fetchProfile,
	fetchSite,
	fetchSites,
	type ProfileObject,
	type SiteObject,
	fetchDomains,
	fetchEmails,
} from '../data';
import Domains from '../domains';
import Emails from '../emails';
import Header from '../header';
import Billing from '../me/billing';
import MeNotifications from '../me/notifications';
import Privacy from '../me/privacy';
import Security from '../me/security';
import Profile from '../profile';
import Reader from '../reader';
import Site from '../site';
import SiteDeployments from '../site-deployments';
import SiteOverview from '../site-overview';
import Sites from '../sites';
import NotFound from './404';
import { queryClient } from './query-client';

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
					loader: () =>
						queryClient.ensureQueryData( {
							queryKey: [ 'sites' ],
							queryFn: fetchSites,
						} ) as Promise< SiteObject[] >,
				},
				{
					id: 'site',
					path: 'sites/:id',
					element: <Site />,
					loader: fetchSite,
					children: [
						{
							path: '',
							element: <SiteOverview />,
						},
						{
							path: 'deployments',
							element: <SiteDeployments />,
						},
					],
				},
				{
					path: 'domains',
					element: <Domains />,
					loader: () =>
						queryClient.ensureQueryData( {
							queryKey: [ 'domains' ],
							queryFn: fetchDomains,
						} ) as Promise< Domain[] >,
				},
				{
					path: 'emails',
					element: <Emails />,
					loader: () =>
						queryClient.ensureQueryData( {
							queryKey: [ 'emails' ],
							queryFn: fetchEmails,
						} ) as Promise< Email[] >,
				},
				{
					path: 'me/profile',
					element: <Profile />,
					loader: () =>
						queryClient.ensureQueryData( {
							queryKey: [ 'profile' ],
							queryFn: fetchProfile,
						} ) as Promise< ProfileObject >,
					action: async ( { request }: ActionFunctionArgs ) => {
						const data = await request.json();
						try {
							await updateProfile( data as ProfileObject );
							return json( { ok: true } );
						} catch ( error ) {
							return json(
								{ ok: false, error: __( 'Failed to update profile' ) },
								{ status: 400 }
							);
						}
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
		{
			path: '*',
			element: <NotFound />,
		},
	],
	{
		basename: '/v2',
	}
);
