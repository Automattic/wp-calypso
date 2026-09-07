/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react';
import DiscoverNewBlogs from '../index';
import type { OonRec } from '../types';

// Mock the card: it hydrates through the Reader post store and needs
// redux / react-query / a real post.
jest.mock( '../card', () => ( props: { rec: OonRec; onDismiss: () => void } ) => (
	<li data-testid="oon-card">
		<span>{ `Post ${ props.rec.postId }` }</span>
		<button onClick={ props.onDismiss }>dismiss</button>
	</li>
) );
jest.mock( 'calypso/state', () => ( {
	useDispatch: () => jest.fn(),
} ) );
jest.mock( 'calypso/state/reader/analytics/actions', () => ( {
	recordReaderTracksEvent: jest.fn(),
} ) );
jest.mock( 'i18n-calypso', () => ( {
	useTranslate: () => ( str: string ) => str,
} ) );
jest.mock( '@wordpress/components', () => ( {
	Button: ( props: { children: React.ReactNode; onClick: () => void } ) => (
		<button onClick={ props.onClick }>{ props.children }</button>
	),
} ) );

const makeRec = ( n: number ): OonRec => ( { blogId: n, postId: n * 10, score: 1 / n } );

const renderModule = ( recs: OonRec[], overrides = {} ) => {
	const props = { recs, dismissBlog: jest.fn(), hide: jest.fn(), ...overrides };
	return { ...render( <DiscoverNewBlogs { ...props } /> ), props };
};

describe( 'DiscoverNewBlogs', () => {
	afterEach( () => jest.clearAllMocks() );

	it( 'renders nothing when there are no recs', () => {
		const { container } = renderModule( [] );
		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'renders the labelled module with cards when recs exist', () => {
		renderModule( [ makeRec( 1 ), makeRec( 2 ) ] );
		expect( screen.getByRole( 'heading', { name: 'Discover new blogs' } ) ).toBeVisible();
		expect( screen.getByText( 'Post 10' ) ).toBeVisible();
		expect( screen.getByText( 'Post 20' ) ).toBeVisible();
	} );

	it( 'shows a fixed maximum of 3 cards', () => {
		const many = Array.from( { length: 20 }, ( _, i ) => makeRec( i + 1 ) );
		renderModule( many );
		expect( screen.getAllByTestId( 'oon-card' ) ).toHaveLength( 3 );
	} );

	it( 'dismisses by blog when a card X is clicked', () => {
		const { props } = renderModule( [ makeRec( 3 ) ] );
		screen.getByRole( 'button', { name: 'dismiss' } ).click();
		expect( props.dismissBlog ).toHaveBeenCalledWith( 3 );
	} );

	it( 'pages to the next 3 recs with "More like this", and hides the link at the end', () => {
		renderModule( [ 1, 2, 3, 4, 5 ].map( makeRec ) );
		expect( screen.getByText( 'Post 10' ) ).toBeVisible();
		fireEvent.click( screen.getByRole( 'button', { name: 'More like this' } ) );
		expect( screen.queryByText( 'Post 10' ) ).not.toBeInTheDocument();
		expect( screen.getByText( 'Post 40' ) ).toBeVisible();
		expect( screen.getAllByTestId( 'oon-card' ) ).toHaveLength( 2 );
		expect( screen.queryByRole( 'button', { name: 'More like this' } ) ).not.toBeInTheDocument();
	} );

	it( 'falls back to the previous page when the current page is dismissed away', () => {
		const recs = [ 1, 2, 3, 4 ].map( makeRec );
		const { rerender } = render(
			<DiscoverNewBlogs recs={ recs } dismissBlog={ jest.fn() } hide={ jest.fn() } />
		);
		fireEvent.click( screen.getByRole( 'button', { name: 'More like this' } ) );
		expect( screen.getByText( 'Post 40' ) ).toBeVisible();

		// Blog 4 dismissed: page 2 is now empty, so page 1 should show again.
		rerender(
			<DiscoverNewBlogs recs={ recs.slice( 0, 3 ) } dismissBlog={ jest.fn() } hide={ jest.fn() } />
		);
		expect( screen.getAllByTestId( 'oon-card' ) ).toHaveLength( 3 );
		expect( screen.getByText( 'Post 10' ) ).toBeVisible();
		expect( screen.queryByRole( 'button', { name: 'More like this' } ) ).not.toBeInTheDocument();
	} );

	it( 'hides the module when Hide is clicked', () => {
		const { props } = renderModule( [ makeRec( 3 ) ] );
		screen.getByRole( 'button', { name: 'Hide' } ).click();
		expect( props.hide ).toHaveBeenCalled();
	} );
} );
