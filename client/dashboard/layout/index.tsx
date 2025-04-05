import { QueryClientProvider } from '@tanstack/react-query';
import { useMemo } from 'react';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from '../auth/auth-context';
import { queryClient } from './query-client';
import { createRouter } from './router';

import './style.scss';

function Layout() {
	const router = useMemo( () => createRouter(), [] );
	return (
		<QueryClientProvider client={ queryClient }>
			<AuthProvider>
				<RouterProvider router={ router } />
			</AuthProvider>
		</QueryClientProvider>
	);
}
export default Layout;
