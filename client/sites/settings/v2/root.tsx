import { Outlet } from '@tanstack/react-router';
import Snackbars from 'calypso/dashboard/app/snackbars';
import { PageViewTracker } from 'calypso/dashboard/components/page-view-tracker';
import './style.scss';

export default function Root() {
	return (
		<>
			<Outlet />
			<Snackbars />
			<PageViewTracker />
		</>
	);
}
