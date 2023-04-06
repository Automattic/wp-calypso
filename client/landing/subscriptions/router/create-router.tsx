import { createBrowserRouter, Navigate } from 'react-router-dom';
import { SubscriptionManagerPage } from './routes/subscriptions';
import { Comments } from './routes/subscriptions/comments';
import { Settings } from './routes/subscriptions/settings';
import { Sites } from './routes/subscriptions/sites';

const createRouter = () =>
	createBrowserRouter( [
		{
			path: '/',
			children: [
				{
					path: 'subscriptions/*',
					element: <SubscriptionManagerPage />,
					children: [
						{ index: true, element: <Navigate to="sites" /> },
						{ path: 'sites*', element: <Sites /> },
						{ path: 'comments*', element: <Comments /> },
						{ path: 'settings*', element: <Settings /> },
					],
				},
			],
		},
	] );

export default createRouter;
