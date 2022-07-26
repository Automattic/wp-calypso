import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider as ReduxProvider } from 'react-redux';
import PluginBrowser from './plugins-browser';

export default ( { store, ...props } ) => {
	const queryClient = new QueryClient();
	return (
		<ReduxProvider store={ store }>
			<QueryClientProvider client={ queryClient }>
				<PluginBrowser { ...props } />
			</QueryClientProvider>
		</ReduxProvider>
	);
};
