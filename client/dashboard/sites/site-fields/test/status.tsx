/**
 * @jest-environment jsdom
 */
import { render as testingLibraryRender } from '@testing-library/react';
import { AuthContext } from '../../../app/auth';
import { Status } from '../index';
import type { User, Site } from '@automattic/api-core';

const userId = 1;

function render( ui: React.ReactElement ) {
	return testingLibraryRender(
		<AuthContext.Provider value={ { user: { ID: userId } as User } }>{ ui }</AuthContext.Provider>
	);
}

describe( '<Status>', () => {
	test( 'for migrated sites with a "migration-pending" status, it renders "Migration pending"', () => {
		const site = {
			site_migration: {
				migration_status: 'migration-pending-difm',
			},
		} as Site;
		const { container } = render( <Status site={ site } /> );
		expect( container.textContent ).toBe( 'Migration pending' );
	} );

	test( 'for migrated sites with a "migration-started" status, it renders "Migration started"', () => {
		const site = {
			slug: 'test.wordpress.com',
			site_migration: {
				migration_status: 'migration-started-difm',
			},
		} as Site;
		const { container } = render( <Status site={ site } /> );
		expect( container.textContent ).toBe( 'Migration started' );
	} );

	test( 'for migrated sites with a "migration-in-progress" status, it renders "Migration started"', () => {
		const site = {
			slug: 'test.wordpress.com',
			site_migration: {
				migration_status: 'migration-in-progress',
			},
		} as Site;
		const { container } = render( <Status site={ site } /> );
		expect( container.textContent ).toBe( 'Migration started' );
	} );

	test( 'for unlaunched sites, it renders a "Finish setup" link', () => {
		const site = {
			slug: 'test.wordpress.com',
			site_migration: {},
			launch_status: 'unlaunched',
			is_private: true,
		} as Site;
		const { container, getByRole } = render( <Status site={ site } /> );
		expect( container.textContent ).toBe( 'Finish setup↗' );
		expect( getByRole( 'link', { name: /Finish setup/ } ) ).toHaveAttribute(
			'href',
			'/home/test.wordpress.com'
		);
	} );

	test( 'for launched sites, it renders the site visibility', () => {
		const site = {
			site_migration: {},
			is_private: true,
		} as Site;
		const { container } = render( <Status site={ site } /> );
		expect( container.textContent ).toBe( 'Private' );
	} );

	test( 'for deleted sites, it renders "Deleted"', () => {
		const site = {
			site_migration: {},
			is_deleted: true,
		} as Site;
		const { container } = render( <Status site={ site } /> );
		expect( container.textContent ).toBe( 'Deleted' );
	} );

	test( 'for sites still being built via DIFM, it renders "Express service"', () => {
		const site = {
			site_migration: {},
			options: { is_difm_lite_in_progress: true },
		} as Site;
		const { container } = render( <Status site={ site } /> );
		expect( container.textContent ).toBe( 'Express service' );
	} );

	test( 'for sites with expired plan, it renders "Plan expired"', () => {
		const site = {
			site_migration: {},
			plan: {
				product_name_short: 'Business',
				expired: true,
			},
		} as Site;
		const { container } = render( <Status site={ site } /> );
		expect( container.textContent ).toBe( 'Plan expired' );
	} );

	test( 'for sites with expired plan, it renders "Plan expired" and a renewal nag for the site owner', () => {
		const site = {
			slug: 'test.wordpress.com',
			site_owner: userId,
			site_migration: {},
			plan: {
				product_slug: 'business-bundle',
				product_name_short: 'Business',
				expired: true,
			},
		} as Site;
		const { getByText, getByRole } = render( <Status site={ site } /> );
		expect( getByText( 'Plan expired' ) ).toBeInTheDocument();
		expect( getByRole( 'link', { name: /Renew plan/ } ) ).toHaveAttribute(
			'href',
			'/checkout/test.wordpress.com/business-bundle'
		);
	} );
} );
