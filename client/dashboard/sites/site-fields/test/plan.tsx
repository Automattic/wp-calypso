/**
 * @jest-environment jsdom
 */
import { render as testingLibraryRender } from '@testing-library/react';
import { AuthContext } from '../../../app/auth';
import { Plan } from '../index';
import type { User, Site } from '@automattic/api-core';

const userId = 1;

function render( ui: React.ReactElement ) {
	return testingLibraryRender(
		<AuthContext.Provider
			value={ { user: { ID: userId } as User, logoutUrl: '', handleLogout: () => {} } }
		>
			{ ui }
		</AuthContext.Provider>
	);
}

describe( '<Plan>', () => {
	test( 'for staging sites, it renders "Staging site"', () => {
		const site = {
			is_wpcom_staging_site: true,
		} as Site;
		const { container } = render( <Plan site={ site } /> );
		expect( container.textContent ).toBe( 'Staging site' );
	} );

	test( 'for self-hosted, Jetpack-connected sites, active Jetpack plugin, it renders the Jetpack logo and plan name', () => {
		const site = {
			is_wpcom_atomic: false,
			jetpack_connection: true,
			jetpack: true,
			plan: {
				product_name_short: 'Free',
			},
		} as Site;
		const { container } = render( <Plan site={ site } /> );
		expect( container.querySelector( 'svg' ) ).toBeInTheDocument();
		expect( container.textContent ).toBe( 'Free' );
	} );

	test( 'for self-hosted, Jetpack-connected sites, inactive Jetpack plugin, it renders dash', () => {
		const site = {
			is_wpcom_atomic: false,
			jetpack_connection: true,
			jetpack: false,
			plan: {
				product_name_short: 'Free',
			},
		} as Site;
		const { container } = render( <Plan site={ site } /> );
		expect( container.textContent ).toBe( '-' );
	} );

	test( 'for WordPress.com Simple sites, it renders the plan name', () => {
		const site = {
			is_wpcom_atomic: false,
			jetpack_connection: false,
			jetpack: false,
			plan: {
				product_name_short: 'Premium',
			},
		} as Site;
		const { container } = render( <Plan site={ site } /> );
		expect( container.textContent ).toBe( 'Premium' );
	} );

	test( 'for WordPress.com Atomic sites, it renders the plan name', () => {
		const site = {
			is_wpcom_atomic: true,
			jetpack_connection: true,
			jetpack: true,
			plan: {
				product_name_short: 'Business',
			},
		} as Site;
		const { container } = render( <Plan site={ site } /> );
		expect( container.textContent ).toBe( 'Business' );
	} );

	test( 'for sites with expired plan, it renders the plan name with "-expired" suffix', () => {
		const site = {
			plan: {
				product_name_short: 'Business',
				expired: true,
			},
		} as Site;
		const { container } = render( <Plan site={ site } /> );
		expect( container.textContent ).toBe( 'Business-expired' );
	} );

	test( 'for sites with expired plan, it renders the plan name with "-expired" suffix and a renewal nag for the site owner', () => {
		const site = {
			slug: 'test.wordpress.com',
			site_owner: userId,
			plan: {
				product_slug: 'business-bundle',
				product_name_short: 'Business',
				expired: true,
			},
		} as Site;
		const { getByText, getByRole } = render( <Plan site={ site } /> );
		expect( getByText( 'Business-expired' ) ).toBeInTheDocument();
		expect( getByRole( 'link', { name: /Renew plan/ } ) ).toHaveAttribute(
			'href',
			'/checkout/test.wordpress.com/business-bundle'
		);
	} );

	test( 'for Trial sites with expired plan, it renders the plan name with "-expired" suffix and an upgrade nag for the site owner', () => {
		const site = {
			slug: 'test.wordpress.com',
			site_owner: userId,
			plan: {
				product_slug: 'ecommerce-trial-bundle-monthly',
				product_name_short: 'Trial',
				expired: true,
			},
		} as Site;
		const { getByText, getByRole } = render( <Plan site={ site } /> );
		expect( getByText( 'Trial-expired' ) ).toBeInTheDocument();
		expect( getByRole( 'link', { name: /Upgrade/ } ) ).toHaveAttribute(
			'href',
			'/plans/test.wordpress.com'
		);
	} );
} );
