/**
 * @jest-environment jsdom
 */
import { getAgencyActions } from '../actions';
import type { AgencySite } from '@automattic/api-core';
import type { ActionButton } from '@wordpress/dataviews';

const atomic: AgencySite = {
	blog_id: 1,
	a4a_site_id: 11,
	url: 'atomic.example.com',
	is_atomic: true,
	has_backup: true,
};
const jetpack: AgencySite = {
	blog_id: 2,
	a4a_site_id: 12,
	url: 'jetpack.example.com',
	has_backup: true,
};
const devSite: AgencySite = {
	blog_id: 3,
	a4a_site_id: 13,
	url: 'dev.example.com',
	is_atomic: true,
	a4a_is_dev_site: true,
};
const urlOnly: AgencySite = {
	blog_id: 4,
	a4a_site_id: 14,
	url: 'urlonly.example.com',
	sticker: [ 'jetpack-manage-url-only-site' ],
};
const migrating: AgencySite = {
	blog_id: 5,
	url: 'migrating.example.com',
	is_atomic: true,
	sticker: [ 'migration-in-process' ],
};
const simple: AgencySite = { blog_id: 6, url: 'simple.example.com', is_simple: true };
const unreachable: AgencySite = {
	blog_id: 7,
	url: 'broken.example.com',
	is_atomic: true,
	is_connection_healthy: false,
};

const ALL_ACTION_IDS = [
	'admin',
	'site',
	'prepare-for-launch',
	'set-up-site',
	'change-domain',
	'settings',
	'issue-license',
	'view-activity',
	'clone-site',
	'clone-site-backups',
	'remove-site',
];

function setup( {
	canIssueLicenses = true,
	canRemoveSites = true,
}: { canIssueLicenses?: boolean; canRemoveSites?: boolean } = {} ) {
	const onOpenSettings = jest.fn();
	const onPrepareForLaunch = jest.fn();
	const onSetUpSite = jest.fn();
	const onViewBackups = jest.fn();

	const actions = getAgencyActions( {
		canIssueLicenses,
		canRemoveSites,
		onIssueLicense: jest.fn(),
		onOpenSettings,
		onPrepareForLaunch,
		onSetUpSite,
		onViewActivity: jest.fn(),
		onViewBackups,
		recordTracksEvent: jest.fn(),
	} );

	const action = ( id: string ) => {
		const found = actions.find( ( candidate ) => candidate.id === id );
		if ( ! found ) {
			throw new Error( `Action "${ id }" not found` );
		}
		return found;
	};

	// `Action` is a union, and only the button half carries a callback.
	const buttonAction = ( id: string ): ActionButton< AgencySite > => {
		const found = action( id );
		if ( ! ( 'callback' in found ) ) {
			throw new Error( `Action "${ id }" opens a modal and has no callback` );
		}
		return found;
	};

	// An action without `isEligible` is always available.
	const isEligible = ( id: string, site: AgencySite ) => action( id ).isEligible?.( site ) ?? true;

	const eligibleIds = ( site: AgencySite ) =>
		ALL_ACTION_IDS.filter( ( id ) => isEligible( id, site ) );

	return {
		buttonAction,
		isEligible,
		eligibleIds,
		onOpenSettings,
		onPrepareForLaunch,
		onSetUpSite,
		onViewBackups,
	};
}

// DataViews hands the callback a registry it doesn't need here.
const NO_CONTEXT = { registry: undefined };

describe( 'getAgencyActions eligibility', () => {
	test( 'offers the full management set on an Atomic site', () => {
		const { eligibleIds } = setup();

		expect( eligibleIds( atomic ).sort() ).toEqual(
			[
				'admin',
				'site',
				'set-up-site',
				'change-domain',
				'settings',
				'view-activity',
				'clone-site',
				'remove-site',
			].sort()
		);
	} );

	test( 'offers licensing and the in-app copy on a Jetpack site', () => {
		const { eligibleIds } = setup();

		expect( eligibleIds( jetpack ).sort() ).toEqual(
			[
				'admin',
				'site',
				'issue-license',
				'view-activity',
				'clone-site-backups',
				'remove-site',
			].sort()
		);
	} );

	test( 'offers launch on a dev site, but not a domain change or removal', () => {
		const { isEligible } = setup();

		expect( isEligible( 'prepare-for-launch', devSite ) ).toBe( true );
		expect( isEligible( 'change-domain', devSite ) ).toBe( false );
		expect( isEligible( 'remove-site', devSite ) ).toBe( false );
	} );

	// Classic hides every action on these sites. Visiting the public URL doesn't
	// depend on the Jetpack connection, so it stays offered here.
	test.each( [
		[ 'a migrating site', migrating ],
		[ 'a Simple site', simple ],
		[ 'a site with an unhealthy connection', unreachable ],
	] )( 'leaves only Visit site on %s', ( _label, site ) => {
		const { eligibleIds } = setup();

		expect( eligibleIds( site ) ).toEqual( [ 'site' ] );
	} );

	// Nothing can reach a URL-only site, but dropping it from the dashboard is a
	// local operation, so removal stays available.
	test( 'leaves only Visit site and Remove site on a URL-only site', () => {
		const { eligibleIds } = setup();

		expect( eligibleIds( urlOnly ) ).toEqual( [ 'site', 'remove-site' ] );
	} );

	// The removal endpoint keys off `a4a_site_id`, so offering it on a site that
	// has none opens a modal that can only say no.
	test( 'withholds removal while a site is still being set up', () => {
		const { isEligible } = setup();

		expect( isEligible( 'remove-site', { ...atomic, a4a_site_id: undefined } ) ).toBe( false );
	} );

	test( 'withholds removal without the capability', () => {
		const { isEligible } = setup( { canRemoveSites: false } );

		expect( isEligible( 'remove-site', atomic ) ).toBe( false );
		expect( isEligible( 'remove-site', jetpack ) ).toBe( false );
	} );

	// Issuing a license goes to the Marketplace, which is capability-gated, so
	// don't offer a menu item that dead-ends there.
	test( 'withholds licensing without access to the Marketplace', () => {
		const { isEligible } = setup( { canIssueLicenses: false } );

		expect( isEligible( 'issue-license', jetpack ) ).toBe( false );
	} );
} );

describe( 'getAgencyActions destinations', () => {
	// Settings and site visibility have agency routes; a clone does not, so only
	// that one leaves the dashboard.
	test( 'keeps launch, settings and setup in-app', () => {
		const { buttonAction, onOpenSettings, onPrepareForLaunch, onSetUpSite } = setup();

		buttonAction( 'prepare-for-launch' ).callback( [ devSite ], NO_CONTEXT );
		expect( onPrepareForLaunch ).toHaveBeenCalledWith( devSite );

		buttonAction( 'settings' ).callback( [ atomic ], NO_CONTEXT );
		expect( onOpenSettings ).toHaveBeenCalledWith( atomic );

		// The dashboard has its own overview for the site, so this no longer
		// leaves for WordPress.com.
		const open = jest.spyOn( window, 'open' ).mockImplementation( () => null );
		buttonAction( 'set-up-site' ).callback( [ atomic ], NO_CONTEXT );
		expect( onSetUpSite ).toHaveBeenCalledWith( atomic );
		expect( open ).not.toHaveBeenCalled();
		open.mockRestore();
	} );

	test( 'sends each copy action to the right destination', () => {
		const open = jest.spyOn( window, 'open' ).mockImplementation( () => null );
		const { buttonAction, onViewBackups } = setup();

		buttonAction( 'clone-site' ).callback( [ atomic ], NO_CONTEXT );
		expect( open ).toHaveBeenCalledWith(
			expect.stringContaining( '/backup/atomic.example.com/clone' ),
			'_blank'
		);

		buttonAction( 'clone-site-backups' ).callback( [ jetpack ], NO_CONTEXT );
		expect( onViewBackups ).toHaveBeenCalledWith( jetpack );

		open.mockRestore();
	} );
} );
