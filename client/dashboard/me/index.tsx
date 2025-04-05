import { Outlet } from '@tanstack/react-router';
import HeaderBar from '../header-bar';
import MeMenu from '../me-menu';

function Me() {
	return (
		<>
			<HeaderBar>
				<MeMenu />
			</HeaderBar>
			<Outlet />
		</>
	);
}

export default Me;
