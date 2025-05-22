import { Outlet } from '@tanstack/react-router';
import Snackbars from 'calypso/dashboard/app/snackbars';
import './style.scss';

export default function Root() {
	return (
		<>
			<Outlet />
			<Snackbars />
		</>
	);
}
