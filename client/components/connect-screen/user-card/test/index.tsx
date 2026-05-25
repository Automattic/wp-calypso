/** @jest-environment jsdom */
import { render, screen } from '@testing-library/react';
import React from 'react';
import { UserCard } from '../index';

// Mock i18n-calypso
jest.mock( 'i18n-calypso', () => ( {
	useTranslate: () => {
		const translate = (
			singular: string,
			plural?: string,
			options?: { count?: number; args?: Record< string, unknown > }
		) => {
			if ( plural && options?.count !== undefined ) {
				const template = options.count === 1 ? singular : plural;
				return template
					.replace( '%(username)s', String( options.args?.username ) )
					.replace( '%(count)d', String( options.args?.count ) );
			}
			return singular;
		};
		return translate;
	},
	localize: ( Component: React.ComponentType ) => Component,
	withRtl: ( Component: React.ComponentType ) => Component,
} ) );

describe( 'UserCard', () => {
	const mockUser = {
		displayName: 'John Doe',
		email: 'john@example.com',
		avatarUrl: 'https://example.com/avatar.jpg',
	};

	const mockUserWithSiteCount = {
		...mockUser,
		username: 'johndoe',
		siteCount: 3,
	};

	describe( 'basic rendering', () => {
		it( 'renders the user display name', () => {
			render( <UserCard user={ mockUser } /> );
			expect( screen.getByText( 'John Doe' ) ).toBeInTheDocument();
		} );

		it( 'renders the user email for small size by default', () => {
			render( <UserCard user={ mockUser } /> );
			expect( screen.getByText( 'john@example.com' ) ).toBeInTheDocument();
		} );

		it( 'applies custom className', () => {
			const { container } = render( <UserCard user={ mockUser } className="custom-class" /> );
			expect( container.querySelector( '.custom-class' ) ).toBeInTheDocument();
		} );
	} );

	describe( 'size variants', () => {
		it( 'applies is-small class by default', () => {
			const { container } = render( <UserCard user={ mockUser } /> );
			expect( container.querySelector( '.is-small' ) ).toBeInTheDocument();
		} );

		it( 'applies is-large class when size is large', () => {
			const { container } = render( <UserCard user={ mockUser } size="large" /> );
			expect( container.querySelector( '.is-large' ) ).toBeInTheDocument();
		} );
	} );

	describe( 'site count display', () => {
		it( 'does not show site count when showSiteCount is false (default)', () => {
			render( <UserCard user={ mockUserWithSiteCount } size="small" /> );
			expect( screen.getByText( 'john@example.com' ) ).toBeInTheDocument();
			expect( screen.queryByText( 'johndoe - 3 sites' ) ).not.toBeInTheDocument();
		} );

		it( 'shows username and site count for small variant when showSiteCount is true', () => {
			render( <UserCard user={ mockUserWithSiteCount } size="small" showSiteCount /> );
			expect( screen.getByText( 'johndoe - 3 sites' ) ).toBeInTheDocument();
		} );

		it( 'shows singular site text when site count is 1', () => {
			render(
				<UserCard user={ { ...mockUserWithSiteCount, siteCount: 1 } } size="small" showSiteCount />
			);
			expect( screen.getByText( 'johndoe - 1 site' ) ).toBeInTheDocument();
		} );

		it( 'shows email when username is missing even with showSiteCount enabled', () => {
			render( <UserCard user={ { ...mockUser, siteCount: 3 } } size="small" showSiteCount /> );
			expect( screen.getByText( 'john@example.com' ) ).toBeInTheDocument();
		} );

		it( 'shows email when site count is missing even with showSiteCount enabled', () => {
			render(
				<UserCard user={ { ...mockUser, username: 'johndoe' } } size="small" showSiteCount />
			);
			expect( screen.getByText( 'john@example.com' ) ).toBeInTheDocument();
		} );

		it( 'always shows email for large variant even with showSiteCount enabled', () => {
			render( <UserCard user={ mockUserWithSiteCount } size="large" showSiteCount /> );
			expect( screen.getByText( 'john@example.com' ) ).toBeInTheDocument();
		} );
	} );
} );
