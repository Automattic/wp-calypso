/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react';
import React from 'react';
import wpcom from 'calypso/lib/wp';
import useLinkAnswersMutation from '../use-link-answers-mutation';

const MockedComponent = () => {
	const { mutate } = useLinkAnswersMutation();
	return (
		<div>
			<button
				onClick={ () => mutate( { blogId: 123, surveyKey: 'test-key' } ) }
				data-testid="button-mutate"
			>
				Click me
			</button>
		</div>
	);
};

jest.mock( 'calypso/lib/wp', () => ( {
	req: {
		post: jest.fn(),
	},
} ) );

describe( 'useLinkAnswersMutation', () => {
	let queryClient: QueryClient;
	let wrapper: React.FC< React.PropsWithChildren< any > >;

	beforeEach( () => {
		jest.mocked( wpcom.req.post ).mockReset();

		queryClient = new QueryClient( {
			defaultOptions: {
				queries: {
					retry: false,
				},
			},
		} );

		wrapper = ( { children }: React.PropsWithChildren< any > ) => (
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		);
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should call wpcom.req.post with the right parameters', async () => {
		render( <MockedComponent />, { wrapper } );
		const button = document.querySelector( '[data-testid="button-mutate"]' ) as HTMLButtonElement;
		button && button.click();

		waitFor( () =>
			expect( wpcom.req.post ).toHaveBeenCalledWith( {
				apiNamespace: 'wpcom/v2',
				path: '/segmentation-survey/answers/link',
				body: {
					blog_id: 123,
					survey_key: 'test-key',
				},
			} )
		);
	} );
} );
