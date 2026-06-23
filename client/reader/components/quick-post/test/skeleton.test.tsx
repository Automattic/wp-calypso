/**
 * @jest-environment jsdom
 */
import { getPreference } from 'calypso/state/preferences/selectors';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { READER_QUICK_POST_MINIMIZED_PREFERENCE } from '../constants';
import { QuickPostSkeleton } from '../skeleton';

jest.mock( 'calypso/state/preferences/selectors', () => ( {
	getPreference: jest.fn(),
} ) );

describe( 'QuickPostSkeleton', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'renders the full expanded skeleton by default', () => {
		( getPreference as jest.Mock ).mockReturnValue( null );

		const { container } = renderWithProvider( <QuickPostSkeleton /> );

		expect( container.querySelectorAll( '.quick-post-skeleton span' ) ).toHaveLength( 3 );
	} );

	it( 'renders a single collapsed bar when the editor is minimized', () => {
		( getPreference as jest.Mock ).mockImplementation( ( _state, key ) =>
			key === READER_QUICK_POST_MINIMIZED_PREFERENCE ? true : null
		);

		const { container } = renderWithProvider( <QuickPostSkeleton /> );

		expect( container.querySelectorAll( '.quick-post-skeleton span' ) ).toHaveLength( 1 );
	} );
} );
