import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import './style.scss';

const queryClient = new QueryClient();

function Layout() {
	return (
		<QueryClientProvider client={ queryClient }>
			<RouterProvider router={ router } />
		</QueryClientProvider>
	);
}

export default Layout;
