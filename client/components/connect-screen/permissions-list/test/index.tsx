/** @jest-environment jsdom */
import { render, screen, fireEvent } from '@testing-library/react';
import { check, edit, cog } from '@wordpress/icons';
import React from 'react';
import { PermissionsList } from '../index';

// Mock i18n-calypso
jest.mock( 'i18n-calypso', () => ( {
	useTranslate: () => {
		const translate = (
			singular: string,
			_plural?: string,
			options?: { args?: Record< string, unknown > }
		) => {
			if ( options?.args?.count !== undefined ) {
				return `${ options.args.count } more`;
			}
			return singular;
		};
		return translate;
	},
	localize: ( Component: React.ComponentType ) => Component,
	withRtl: ( Component: React.ComponentType ) => Component,
} ) );

describe( 'PermissionsList', () => {
	const mockPermissions = [
		{ icon: check, label: 'Permission 1' },
		{ icon: edit, label: 'Permission 2' },
		{ icon: cog, label: 'Permission 3' },
	];

	const mockPermissionsWithNames = [
		{ name: 'users', label: 'View profile' },
		{ name: 'posts', label: 'Edit posts' },
		{ name: 'unknown', label: 'Unknown permission' },
	];

	describe( 'basic rendering', () => {
		it( 'renders the title when provided', () => {
			render( <PermissionsList title="This app will access:" permissions={ mockPermissions } /> );
			expect( screen.getByText( 'This app will access:' ) ).toBeInTheDocument();
		} );

		it( 'renders all permission labels', () => {
			render( <PermissionsList permissions={ mockPermissions } /> );
			expect( screen.getByText( 'Permission 1' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Permission 2' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Permission 3' ) ).toBeInTheDocument();
		} );

		it( 'applies custom className', () => {
			const { container } = render(
				<PermissionsList permissions={ mockPermissions } className="custom-class" />
			);
			expect( container.querySelector( '.custom-class' ) ).toBeInTheDocument();
		} );
	} );

	describe( 'icon resolution', () => {
		it( 'renders icons when provided directly on permissions', () => {
			const { container } = render( <PermissionsList permissions={ mockPermissions } /> );
			const icons = container.querySelectorAll( '.connect-screen-permissions-list__icon' );
			expect( icons ).toHaveLength( 3 );
		} );

		it( 'uses getIconForPermission callback to resolve icons by name', () => {
			const mockGetIcon = jest.fn( ( name: string ) => {
				if ( name === 'users' ) {
					return check;
				}
				if ( name === 'posts' ) {
					return edit;
				}
				return undefined;
			} );

			render(
				<PermissionsList
					permissions={ mockPermissionsWithNames }
					getIconForPermission={ mockGetIcon }
				/>
			);

			expect( mockGetIcon ).toHaveBeenCalledWith( 'users' );
			expect( mockGetIcon ).toHaveBeenCalledWith( 'posts' );
			expect( mockGetIcon ).toHaveBeenCalledWith( 'unknown' );
		} );

		it( 'renders placeholder when no icon is resolved', () => {
			const { container } = render(
				<PermissionsList permissions={ [ { label: 'No icon permission' } ] } />
			);
			expect(
				container.querySelector( '.connect-screen-permissions-list__icon-placeholder' )
			).toBeInTheDocument();
		} );

		it( 'prioritizes direct icon prop over getIconForPermission', () => {
			const mockGetIcon = jest.fn( () => edit );
			const permissionsWithBoth = [ { icon: check, name: 'test', label: 'Test permission' } ];

			const { container } = render(
				<PermissionsList permissions={ permissionsWithBoth } getIconForPermission={ mockGetIcon } />
			);

			// getIconForPermission should not be called when icon is provided directly
			expect( mockGetIcon ).not.toHaveBeenCalled();
			expect(
				container.querySelector( '.connect-screen-permissions-list__icon' )
			).toBeInTheDocument();
		} );
	} );

	describe( 'expand/collapse behavior', () => {
		const manyPermissions = [
			{ icon: check, label: 'Permission 1' },
			{ icon: check, label: 'Permission 2' },
			{ icon: check, label: 'Permission 3' },
			{ icon: check, label: 'Permission 4' },
			{ icon: check, label: 'Permission 5' },
			{ icon: check, label: 'Permission 6' },
		];

		it( 'shows only maxVisible permissions initially', () => {
			render( <PermissionsList permissions={ manyPermissions } maxVisible={ 2 } /> );
			expect( screen.getByText( 'Permission 1' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Permission 2' ) ).toBeInTheDocument();
			expect( screen.queryByText( 'Permission 3' ) ).not.toBeInTheDocument();
		} );

		it( 'shows expand button when there are more permissions than maxVisible', () => {
			const { container } = render(
				<PermissionsList permissions={ manyPermissions } maxVisible={ 2 } />
			);
			expect(
				container.querySelector( '.connect-screen-permissions-list__expand' )
			).toBeInTheDocument();
		} );

		it( 'expands to show all permissions when expand button is clicked', () => {
			const { container } = render(
				<PermissionsList permissions={ manyPermissions } maxVisible={ 2 } />
			);
			const expandButton = container.querySelector( '.connect-screen-permissions-list__expand' );
			fireEvent.click( expandButton! );
			expect( screen.getByText( 'Permission 6' ) ).toBeInTheDocument();
		} );

		it( 'shows collapse button after expanding', () => {
			const { container } = render(
				<PermissionsList permissions={ manyPermissions } maxVisible={ 2 } />
			);
			const expandButton = container.querySelector( '.connect-screen-permissions-list__expand' );
			fireEvent.click( expandButton! );
			expect(
				container.querySelector( '.connect-screen-permissions-list__collapse' )
			).toBeInTheDocument();
		} );

		it( 'collapses back to maxVisible when collapse button is clicked', () => {
			const { container } = render(
				<PermissionsList permissions={ manyPermissions } maxVisible={ 2 } />
			);
			const expandButton = container.querySelector( '.connect-screen-permissions-list__expand' );
			fireEvent.click( expandButton! );
			const collapseButton = container.querySelector(
				'.connect-screen-permissions-list__collapse'
			);
			fireEvent.click( collapseButton! );
			expect( screen.queryByText( 'Permission 3' ) ).not.toBeInTheDocument();
		} );

		it( 'does not show expand button when permissions count equals maxVisible', () => {
			const { container } = render(
				<PermissionsList permissions={ mockPermissions } maxVisible={ 3 } />
			);
			expect(
				container.querySelector( '.connect-screen-permissions-list__expand' )
			).not.toBeInTheDocument();
		} );
	} );

	describe( 'learn more link', () => {
		it( 'renders learn more link when both text and URL are provided', () => {
			render(
				<PermissionsList
					permissions={ mockPermissions }
					learnMoreText="Learn more"
					learnMoreUrl="https://example.com"
				/>
			);
			const link = screen.getByRole( 'link', { name: 'Learn more' } );
			expect( link ).toBeInTheDocument();
			expect( link ).toHaveAttribute( 'href', 'https://example.com' );
		} );

		it( 'does not render learn more link when only text is provided', () => {
			render( <PermissionsList permissions={ mockPermissions } learnMoreText="Learn more" /> );
			expect( screen.queryByRole( 'link', { name: 'Learn more' } ) ).not.toBeInTheDocument();
		} );

		it( 'does not render learn more link when only URL is provided', () => {
			render(
				<PermissionsList permissions={ mockPermissions } learnMoreUrl="https://example.com" />
			);
			expect( screen.queryByRole( 'link' ) ).not.toBeInTheDocument();
		} );

		it( 'opens learn more link in new tab', () => {
			render(
				<PermissionsList
					permissions={ mockPermissions }
					learnMoreText="Learn more"
					learnMoreUrl="https://example.com"
				/>
			);
			const link = screen.getByRole( 'link', { name: 'Learn more' } );
			expect( link ).toHaveAttribute( 'target', '_blank' );
		} );
	} );
} );
