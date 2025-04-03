import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import Domains from '../domains';
import Header from '../header';
import Profile from '../profile';
import RequireAuth from '../auth/require-auth';
import Site from '../site';
import SiteBackups from '../site-backups';
import Sites from '../sites';

import './style.scss';

const queryClient = new QueryClient();

function Layout() {
	return (
		<QueryClientProvider client={ queryClient }>
			<RequireAuth>
				<RouterProvider router={ router } />
			</RequireAuth>
		</QueryClientProvider>
	);
}

export default Layout;
