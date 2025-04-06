import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { AuthProvider } from '../auth';
import { queryClient } from '../layout/query-client';
import { router } from './router';

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
