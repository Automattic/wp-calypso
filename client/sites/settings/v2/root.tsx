import { Outlet } from '@tanstack/react-router';
import './style.scss';

export default function Root() {
	return (
		<main>
			<Outlet />
		</main>
	);
}
