/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import NavigationHeader from '../index';

jest.mock( '@automattic/components', () => ( { Gridicon: () => null } ) );
jest.mock( 'calypso/components/info-popover', () => () => null );
jest.mock( 'calypso/components/screen-options-tab', () => () => null );

const navigationItems = [ { label: 'Reader', href: '/reader' }, { label: 'Recent' } ];

describe( 'NavigationHeader', () => {
	afterEach( () => {
		window.history.replaceState( null, '', '/' );
	} );

	it.each( [ undefined, 'Posts from your subscriptions' ] )(
		'renders a single header with a title and subtitle %s',
		( subtitle ) => {
			const { container } = render(
				<NavigationHeader title="Recent" subtitle={ subtitle }>
					<button>Change view</button>
				</NavigationHeader>
			);

			expect( container.querySelectorAll( 'header' ) ).toHaveLength( 1 );
			expect( screen.getByRole( 'heading', { level: 1, name: 'Recent' } ) ).toBeVisible();
			expect( screen.getByRole( 'button', { name: 'Change view' } ) ).toBeVisible();
			expect( container.querySelector( '.formatted-header__subtitle' )?.textContent ).toBe(
				subtitle
			);
		}
	);

	it( 'keeps breadcrumbs and an explicitly shown title in the same header', () => {
		const { container } = render(
			<NavigationHeader title="Recent" navigationItems={ navigationItems } alwaysShowTitle />
		);

		expect( container.querySelectorAll( 'header' ) ).toHaveLength( 1 );
		expect( screen.getByRole( 'link', { name: 'Reader' } ) ).toHaveAttribute( 'href', '/reader' );
		expect( screen.getByRole( 'heading', { level: 1, name: 'Recent' } ) ).toBeVisible();
	} );

	it( 'keeps the header when breadcrumbs replace the title', () => {
		const { container } = render(
			<NavigationHeader title="Recent" navigationItems={ navigationItems } />
		);

		expect( container.querySelectorAll( 'header' ) ).toHaveLength( 1 );
		expect( screen.getByRole( 'link', { name: 'Reader' } ) ).toBeVisible();
		expect( screen.queryByRole( 'heading' ) ).not.toBeInTheDocument();
	} );

	it( 'still hides breadcrumbs when noCrumbs is requested', () => {
		window.history.replaceState( null, '', '/?options=noCrumbs' );

		render(
			<NavigationHeader title="Recent" navigationItems={ navigationItems } alwaysShowTitle />
		);

		expect( screen.queryByRole( 'link', { name: 'Reader' } ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'heading', { level: 1, name: 'Recent' } ) ).toBeVisible();
	} );

	it( 'keeps actions available when the title is hidden for logged-out visitors', () => {
		render(
			<NavigationHeader title="Recent" loggedIn={ false }>
				<button>Change view</button>
			</NavigationHeader>
		);

		expect( screen.queryByRole( 'heading' ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Change view' } ) ).toBeVisible();
	} );

	it( 'preserves attributes and the forwarded ref on the outer header', () => {
		const ref = createRef< HTMLElement >();
		const { container } = render(
			<NavigationHeader
				ref={ ref }
				id="reader-navigation"
				className="reader-heading"
				style={ { marginBottom: 12 } }
				title="Recent"
			/>
		);

		expect( ref.current ).toBe( container.querySelector( 'header' ) );
		expect( ref.current ).toHaveAttribute( 'id', 'reader-navigation' );
		expect( ref.current ).toHaveClass( 'navigation-header', 'reader-heading' );
		expect( ref.current ).toHaveStyle( { marginBottom: '12px' } );
	} );
} );
