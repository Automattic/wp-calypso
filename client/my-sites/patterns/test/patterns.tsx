import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderToString } from 'react-dom/server';
import { Provider as ReduxProvider } from 'react-redux';
import Patterns from '../patterns';
import type { Pattern } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/pattern-assembler/types';

const TestComponent = ( { patterns }: { patterns: Pattern[] } ) => {
	const store = {
		dispatch: () => {},
		getState: () => ( { documentHead: {}, ui: {} } ),
	};

	const queryClient = new QueryClient();

	return (
		<ReduxProvider store={ store }>
			<QueryClientProvider client={ queryClient }>
				<Patterns patterns={ patterns } />
			</QueryClientProvider>
		</ReduxProvider>
	);
};

describe( 'Patterns', () => {
	test( 'renders server-side with empty patterns correctly', () => {
		expect( renderToString( <TestComponent patterns={ [] } /> ) ).toMatchSnapshot();
	} );

	test( 'renders server-side with a test pattern correctly', () => {
		const patterns = [
			{
				ID: 1,
				html: '<div>Test pattern</div>',
				title: 'Test pattern',
			},
		];

		expect( renderToString( <TestComponent patterns={ patterns } /> ) ).toMatchSnapshot();
	} );
} );
