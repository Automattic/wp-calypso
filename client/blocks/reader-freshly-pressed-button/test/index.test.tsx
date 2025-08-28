/**
 * @jest-environment jsdom
 */
import { useMobileBreakpoint } from '@automattic/viewport-react';
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
jest.mock( '@automattic/viewport-react', () => {
	return {
		useMobileBreakpoint: jest.fn().mockReturnValue( false ),
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
		jest.mocked( useMobileBreakpoint ).mockReturnValue( false );
	} );

	const Wrapper = ( { children }: { children: React.ReactNode } ) => {
		const queryClient = new QueryClient();
		return <QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>;
	};

	it( 'shows the loading state', () => {
		jest.mocked( useEligibilityQuery ).mockReturnValue( {
			data: undefined,
			isLoading: true,
		} as unknown as ReturnType< typeof useEligibilityQuery > );

		render( <ReaderFreshlyPressedButton blogId={ 1 } postId={ 1 } />, { wrapper: Wrapper } );

		expect( screen.getByRole( 'button', { name: 'Loading…' } ) ).toBeVisible();
		expect( screen.getByRole( 'button' ) ).toBeDisabled();
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

			expect(
				screen.getByRole( 'button', { name: 'Suggest for Freshly Pressed' } )
			).toBeDisabled();
		} );

		it( 'shows the reason why the post is not eligible', () => {
			render( <ReaderFreshlyPressedButton blogId={ 1 } postId={ 1 } />, { wrapper: Wrapper } );

			expect( screen.getByRole( 'button' ) ).toHaveAttribute(
				'data-tooltip',
				'This post is not eligible for Freshly Pressed'
			);
		} );

		it( 'shows a short version on mobile', () => {
			jest.mocked( useMobileBreakpoint ).mockReturnValue( true );
			render( <ReaderFreshlyPressedButton blogId={ 1 } postId={ 1 } />, { wrapper: Wrapper } );

			expect( screen.getByRole( 'button', { name: 'Suggest' } ) ).toBeVisible();
		} );
	} );

	describe( 'when the post is eligible', () => {
		beforeEach( () => {
			jest.clearAllMocks();
			jest.mocked( useEligibilityQuery ).mockReturnValue( {
				data: { eligible: true, details: null, status: 'eligible' },
			} as unknown as ReturnType< typeof useEligibilityQuery > );
		} );

		it( 'enables the button', () => {
			render( <ReaderFreshlyPressedButton blogId={ 1 } postId={ 1 } />, { wrapper: Wrapper } );

			expect( screen.getByRole( 'button', { name: 'Suggest for Freshly Pressed' } ) ).toBeEnabled();
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

			await userEvent.click(
				screen.getByRole( 'button', { name: 'Suggest for Freshly Pressed' } )
			);

			expect( mutate ).toHaveBeenCalled();
		} );
	} );

	describe( 'when the post is being suggested', () => {
		beforeEach( () => {
			jest.mocked( useEligibilityQuery ).mockReturnValue( {
				data: { eligible: true, details: null, status: 'eligible' },
			} as unknown as ReturnType< typeof useEligibilityQuery > );

			jest.mocked( useSuggestionMutation ).mockReturnValue( {
				mutate: jest.fn(),
				isPending: true,
			} as unknown as ReturnType< typeof useSuggestionMutation > );
		} );

		it( 'disables the button', () => {
			render( <ReaderFreshlyPressedButton blogId={ 1 } postId={ 1 } />, { wrapper: Wrapper } );

			expect(
				screen.getByRole( 'button', { name: 'Suggest for Freshly Pressed' } )
			).toBeDisabled();
		} );

		it( 'shows a short version on mobile', () => {
			jest.mocked( useMobileBreakpoint ).mockReturnValue( true );
			render( <ReaderFreshlyPressedButton blogId={ 1 } postId={ 1 } />, { wrapper: Wrapper } );

			expect( screen.getByRole( 'button', { name: 'Suggest' } ) ).toBeVisible();
		} );
	} );

	describe( 'when the post is suggested with success', () => {
		beforeEach( () => {
			jest.mocked( useEligibilityQuery ).mockReturnValue( {
				data: { eligible: true, details: null, status: 'suggested' },
			} as unknown as ReturnType< typeof useEligibilityQuery > );

			jest.mocked( useSuggestionMutation ).mockReturnValue( {
				mutate: jest.fn(),
				isPending: false,
				isSuccess: true,
			} as unknown as ReturnType< typeof useSuggestionMutation > );
		} );

		it( 'shows the success state', () => {
			render( <ReaderFreshlyPressedButton blogId={ 1 } postId={ 1 } />, { wrapper: Wrapper } );

			expect(
				screen.getByRole( 'button', { name: 'Post suggested for Freshly Pressed' } )
			).toBeVisible();
		} );

		it( 'disables the button', () => {
			render( <ReaderFreshlyPressedButton blogId={ 1 } postId={ 1 } />, { wrapper: Wrapper } );

			expect(
				screen.getByRole( 'button', { name: 'Post suggested for Freshly Pressed' } )
			).toBeDisabled();
		} );

		it( 'shows a short version on mobile', () => {
			jest.mocked( useMobileBreakpoint ).mockReturnValue( true );
			render( <ReaderFreshlyPressedButton blogId={ 1 } postId={ 1 } />, { wrapper: Wrapper } );
			expect( screen.getByRole( 'button', { name: 'Suggested' } ) ).toBeVisible();
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
