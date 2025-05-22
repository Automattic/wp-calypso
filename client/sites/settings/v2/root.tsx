import { Outlet } from '@tanstack/react-router';
import { Suspense, lazy } from 'react';
import Snackbars from 'calypso/dashboard/app/snackbars';
import './style.scss';

const WebpackBuildMonitor = lazy(
	() =>
		import(
			/* webpackChunkName: "async-webpack-build-monitor" */ 'calypso/components/webpack-build-monitor'
		)
);

export default function Root() {
	return (
		<>
			<Outlet />
			<Snackbars />
			{ 'development' === process.env.NODE_ENV && (
				<Suspense fallback={ null }>
					<WebpackBuildMonitor />
				</Suspense>
			) }
		</>
	);
}
