import { QueryClientProvider } from 'react-query';
import { Provider as ReduxProvider } from 'react-redux';
import PluginBrowser from './plugins-browser';

export default ( { queryClient, store, ...props } ) => {
	return (
		<ReduxProvider store={ store }>
			<QueryClientProvider client={ queryClient }>
				<PluginBrowser { ...props } />
			</QueryClientProvider>
		</ReduxProvider>
	);
};
