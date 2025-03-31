/**
 * Internal dependencies
 */
import { RouterProvider } from '../router';
import { Layout } from './layout';
import { routes } from './routes';

export function App() {
	return (
		<RouterProvider routes={ routes } pathArg="page">
			<Layout />
		</RouterProvider>
	);
}
