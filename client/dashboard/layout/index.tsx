import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import RequireAuth from '../auth/require-auth';
import { queryClient } from './query-client';
import { router } from './router';

import './style.scss';

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
