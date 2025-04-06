import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { AuthProvider } from '../auth';
import { queryClient } from '../layout/query-client';
import { routerA4A } from '../layout/router';

function Layout() {
	return (
		<QueryClientProvider client={ queryClient }>
			<AuthProvider>
				<RouterProvider router={ routerA4A } />
			</AuthProvider>
		</QueryClientProvider>
	);
}
export default Layout;
