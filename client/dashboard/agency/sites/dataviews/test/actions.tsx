/**
 * @jest-environment jsdom
 */
import { getAgencyActions } from '../actions';
import type { AgencySite } from '@automattic/api-core';

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

function setup( { canRemoveSites = true }: { canRemoveSites?: boolean } = {} ) {
	const onOpenSettings = jest.fn();
	const onPrepareForLaunch = jest.fn();
	const onViewBackups = jest.fn();

	const actions = getAgencyActions( {
		canRemoveSites,
		onIssueLicense: jest.fn(),
		onOpenSettings,
		onPrepareForLaunch,
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

	// An action without `isEligible` is always available.
	const isEligible = ( id: string, site: AgencySite ) => action( id ).isEligible?.( site ) ?? true;

	const eligibleIds = ( site: AgencySite ) =>
		ALL_ACTION_IDS.filter( ( id ) => isEligible( id, site ) );

	return { action, isEligible, eligibleIds, onOpenSettings, onPrepareForLaunch, onViewBackups };
}

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

	test( 'withholds removal without the capability', () => {
		const { isEligible } = setup( { canRemoveSites: false } );

		expect( isEligible( 'remove-site', atomic ) ).toBe( false );
		expect( isEligible( 'remove-site', jetpack ) ).toBe( false );
	} );
} );

describe( 'getAgencyActions destinations', () => {
	// Settings and site visibility have agency routes; a clone does not, so only
	// that one leaves the dashboard.
	test( 'keeps launch and settings in-app', () => {
		const { action, onOpenSettings, onPrepareForLaunch } = setup();

		action( 'prepare-for-launch' ).callback?.( [ devSite ], {} );
		expect( onPrepareForLaunch ).toHaveBeenCalledWith( devSite );

		action( 'settings' ).callback?.( [ atomic ], {} );
		expect( onOpenSettings ).toHaveBeenCalledWith( atomic );
	} );

	test( 'sends each copy action to the right destination', () => {
		const open = jest.spyOn( window, 'open' ).mockImplementation( () => null );
		const { action, onViewBackups } = setup();

		action( 'clone-site' ).callback?.( [ atomic ], {} );
		expect( open ).toHaveBeenCalledWith(
			expect.stringContaining( '/backup/atomic.example.com/clone' ),
			'_blank'
		);

		action( 'clone-site-backups' ).callback?.( [ jetpack ], {} );
		expect( onViewBackups ).toHaveBeenCalledWith( jetpack );

		open.mockRestore();
	} );
} );
