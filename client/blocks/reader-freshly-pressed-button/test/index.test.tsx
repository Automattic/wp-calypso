/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { when } from 'jest-when';
import { useEligibilityQuery } from 'calypso/data/reader/freshly-pressed/use-eligibility-query';
import { useSuggestionMutation } from 'calypso/data/reader/freshly-pressed/use-suggestion-mutation';
import { errorNotice } from 'calypso/state/notices/actions';
import { ReaderFreshlyPressedButton } from '../index';

jest.mock( 'calypso/data/reader/freshly-pressed/use-eligibility-query', () => {
	return {
		useEligibilityQuery: jest.fn().mockReturnValue( {
			data: { eligible: false, details: null, status: 'not-eligible' },
		} ),
	};
} );

jest.mock( 'calypso/data/reader/freshly-pressed/use-suggestion-mutation', () => {
	return {
		useSuggestionMutation: jest.fn().mockReturnValue( { mutate: jest.fn() } ),
	};
} );

jest.mock( 'calypso/state/notices/actions', () => {
	return {
		errorNotice: jest.fn(),
		successNotice: jest.fn(),
	};
} );

jest.mock( 'calypso/state', () => {
	return {
		useDispatch: () => jest.fn(),
	};
} );

describe( 'ReaderFreshlyPressedButton', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	const Wrapper = ( { children }: { children: React.ReactNode } ) => {
		const queryClient = new QueryClient();
		return <QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>;
	};

	const getButton = () => screen.getByRole( 'button', { name: 'Freshly Press' } );

	it( 'renders the button', () => {
		render( <ReaderFreshlyPressedButton blogId={ 1 } postId={ 1 } />, { wrapper: Wrapper } );

		expect( getButton() ).toBeInTheDocument();
	} );

	describe( 'when the post is not eligible', () => {
		beforeEach( () => {
			return jest.mocked( useEligibilityQuery ).mockReturnValue( {
				data: {
					eligible: false,
					details: {
						code: 'not-eligible',
						reason: 'This post is not eligible for Freshly Pressed',
					},
					status: 'not-eligible',
				},
			} as unknown as ReturnType< typeof useEligibilityQuery > );
		} );

		it( 'disables the button', () => {
			render( <ReaderFreshlyPressedButton blogId={ 1 } postId={ 1 } />, { wrapper: Wrapper } );

			expect( getButton() ).toBeDisabled();
		} );

		it( 'shows the reason why the post is not eligible', () => {
			render( <ReaderFreshlyPressedButton blogId={ 1 } postId={ 1 } />, { wrapper: Wrapper } );

			expect( getButton() ).toHaveAttribute(
				'data-tooltip',
				'This post is not eligible for Freshly Pressed'
			);
		} );
	} );

	describe( 'when the post is eligible', () => {
		beforeEach( () => {
			return jest.mocked( useEligibilityQuery ).mockReturnValue( {
				data: { eligible: true, details: null, status: 'eligible' },
			} as unknown as ReturnType< typeof useEligibilityQuery > );
		} );

		it( 'enables the button', () => {
			render( <ReaderFreshlyPressedButton blogId={ 1 } postId={ 1 } />, { wrapper: Wrapper } );

			expect( getButton() ).toBeEnabled();
		} );

		it( 'sends a suggestion', async () => {
			const mutate = jest.fn();
			const blogId = 123;
			const postId = 789;

			when( useSuggestionMutation )
				.calledWith( { blogId, postId } )
				.mockReturnValue( { mutate } as unknown as ReturnType< typeof useSuggestionMutation > );

			render( <ReaderFreshlyPressedButton blogId={ blogId } postId={ postId } />, {
				wrapper: Wrapper,
			} );

			await userEvent.click( getButton() );

			expect( mutate ).toHaveBeenCalled();
		} );
	} );

	describe( 'when the post is being suggested', () => {
		beforeEach( () => {
			return jest.mocked( useSuggestionMutation ).mockReturnValue( {
				mutate: jest.fn(),
				isPending: true,
			} as unknown as ReturnType< typeof useSuggestionMutation > );
		} );

		it( 'disables the button', () => {
			render( <ReaderFreshlyPressedButton blogId={ 1 } postId={ 1 } />, { wrapper: Wrapper } );

			expect( getButton() ).toBeDisabled();
		} );
	} );

	describe( 'when the post is suggested with success', () => {
		beforeEach( () => {
			return jest.mocked( useSuggestionMutation ).mockReturnValue( {
				mutate: jest.fn(),
				isPending: false,
				isSuccess: true,
			} as unknown as ReturnType< typeof useSuggestionMutation > );
		} );

		it( 'shows the success state', () => {
			render( <ReaderFreshlyPressedButton blogId={ 1 } postId={ 1 } />, { wrapper: Wrapper } );

			expect( getButton() ).toBeVisible();
		} );
		it( 'disables the button', () => {
			render( <ReaderFreshlyPressedButton blogId={ 1 } postId={ 1 } />, { wrapper: Wrapper } );

			expect( getButton() ).toBeDisabled();
		} );
	} );

	describe( 'when the post is suggested with error', () => {
		beforeEach( () => {
			return jest.mocked( useSuggestionMutation ).mockReturnValue( {
				mutate: jest.fn(),
				isPending: false,
				isSuccess: false,
				isError: true,
				error: {
					message: 'This post is not eligible for Freshly Pressed',
				},
			} as unknown as ReturnType< typeof useSuggestionMutation > );
		} );

		it( 'shows the error state', () => {
			render( <ReaderFreshlyPressedButton blogId={ 1 } postId={ 1 } />, { wrapper: Wrapper } );

			expect( errorNotice ).toHaveBeenCalledWith( 'This post is not eligible for Freshly Pressed' );
		} );
	} );
} );
