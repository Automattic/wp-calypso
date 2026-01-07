/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import { Name } from '../index';
import type { Site } from '@automattic/api-core';

describe( '<Name>', () => {
	test( 'for migrated sites with a "migration-pending" status, it renders "Migration pending"', () => {
		const site = {
			name: 'name',
			site_migration: {
				migration_status: 'migration-pending-difm',
			},
		} as Site;
		const { container } = render( <Name site={ site } value={ site.name } /> );
		expect( container ).toHaveTextContent( 'Migration pending' );
	} );

	test( 'for migrated sites with a "migration-started" status, it renders "Migration started"', () => {
		const site = {
			name: 'name',
			slug: 'test.wordpress.com',
			site_migration: {
				migration_status: 'migration-started-difm',
			},
		} as Site;
		const { container } = render( <Name site={ site } value={ site.name } /> );
		expect( container ).toHaveTextContent( 'Migration started' );
	} );

	test( 'for migrated sites with a "migration-in-progress" status, it renders "Migration started"', () => {
		const site = {
			name: 'name',
			slug: 'test.wordpress.com',
			site_migration: {
				migration_status: 'migration-in-progress',
			},
		} as Site;
		const { container } = render( <Name site={ site } value={ site.name } /> );
		expect( container ).toHaveTextContent( 'Migration started' );
	} );

	test( 'for deleted sites, it renders "Deleted"', () => {
		const site = {
			name: 'name',
			site_migration: {},
			is_deleted: true,
		} as Site;
		const { container } = render( <Name site={ site } value={ site.name } /> );
		expect( container ).toHaveTextContent( 'Deleted' );
	} );

	test( 'for sites still being built via DIFM, it renders "Express service"', () => {
		const site = {
			name: 'name',
			site_migration: {},
			options: { is_difm_lite_in_progress: true },
		} as Site;
		const { container } = render( <Name site={ site } value={ site.name } /> );
		expect( container ).toHaveTextContent( 'Express service' );
	} );
} );
