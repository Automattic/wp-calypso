import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import RequireAuth from '../auth/require-auth';
import { router } from './router';

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
