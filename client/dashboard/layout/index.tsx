import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { AuthProvider } from '../auth/auth-context';
import { queryClient } from './query-client';
import { router } from './router';

import './style.scss';

function Layout() {
	return (
		<QueryClientProvider client={ queryClient }>
			<AuthProvider>
				<RouterProvider router={ router } />
			</AuthProvider>
		</QueryClientProvider>
	);
}
export default Layout;
