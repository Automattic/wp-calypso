/**
 * @vitest-environment jsdom
 */

import { vi } from 'vitest';
import { redirectToNewsletter } from '../controller';

let mockIsJetpackCloud = false;

vi.mock( 'calypso/lib/jetpack/is-jetpack-cloud', () => ( {
	__esModule: true,
	default: () => mockIsJetpackCloud,
} ) );

const SITE_ID = 1;
const ADMIN_URL = 'https://example.com/wp-admin/';
const SUBSCRIBERS_URL = `${ ADMIN_URL }admin.php?page=jetpack-newsletter&p=%2F%3Ftab%3Dsubscribers`;

function makeContext( {
	jetpack = false,
	jetpackVersion,
	adminUrl = ADMIN_URL,
	subscriberId,
} = {} ) {
	return {
		params: { domain: 'example.com', subscriberId },
		store: {
			getState: () => ( {
				ui: { selectedSiteId: SITE_ID },
				sites: {
					items: {
						[ SITE_ID ]: {
							ID: SITE_ID,
							URL: 'https://example.com',
							jetpack,
							options: { admin_url: adminUrl, jetpack_version: jetpackVersion },
						},
					},
				},
			} ),
		},
	};
}

describe( 'redirectToNewsletter()', () => {
	let replace;

	beforeEach( () => {
		mockIsJetpackCloud = false;
		replace = vi.fn();
		Object.defineProperty( window, 'location', {
			value: { replace, hash: '' },
			writable: true,
		} );
	} );

	test( 'sends a WordPress.com site to the Subscribers tab in wp-admin', () => {
		const next = vi.fn();

		redirectToNewsletter( makeContext(), next );

		expect( replace ).toHaveBeenCalledWith( SUBSCRIBERS_URL );
		expect( next ).not.toHaveBeenCalled();
	} );

	test( 'carries a numeric subscriber id into the route', () => {
		redirectToNewsletter( makeContext( { subscriberId: '944012532' } ), vi.fn() );

		expect( replace ).toHaveBeenCalledWith(
			`${ ADMIN_URL }admin.php?page=jetpack-newsletter&p=%2F%3Ftab%3Dsubscribers%26subscriber%3D944012532`
		);
	} );

	test( 'ignores a subscriber id that is not an id', () => {
		redirectToNewsletter( makeContext( { subscriberId: 'external-7' } ), vi.fn() );

		expect( replace ).toHaveBeenCalledWith( SUBSCRIBERS_URL );
	} );

	test( 'carries an Add subscribers fragment through to the Newsletter page', () => {
		window.location.hash = '#add-subscribers';

		redirectToNewsletter( makeContext(), vi.fn() );

		expect( replace ).toHaveBeenCalledWith( `${ SUBSCRIBERS_URL }#add-subscribers` );
	} );

	test( 'normalises the fragment this screen appended for itself', () => {
		window.location.hash = '#add-subscribers?method=upload';

		redirectToNewsletter( makeContext(), vi.fn() );

		expect( replace ).toHaveBeenCalledWith( `${ SUBSCRIBERS_URL }#add-subscribers` );
	} );

	test( 'drops a fragment the Newsletter page knows nothing about', () => {
		window.location.hash = '#somewhere-else';

		redirectToNewsletter( makeContext(), vi.fn() );

		expect( replace ).toHaveBeenCalledWith( SUBSCRIBERS_URL );
	} );

	test( 'renders for self-hosted Jetpack below 16.1, which has no wp-admin page yet', () => {
		const next = vi.fn();

		redirectToNewsletter( makeContext( { jetpack: true, jetpackVersion: '16.0' } ), next );

		expect( replace ).not.toHaveBeenCalled();
		expect( next ).toHaveBeenCalled();
	} );

	test( 'renders rather than redirecting to itself when wp-admin is unknown', () => {
		const next = vi.fn();

		redirectToNewsletter( makeContext( { adminUrl: null } ), next );

		expect( replace ).not.toHaveBeenCalled();
		expect( next ).toHaveBeenCalled();
	} );

	test( 'renders on Jetpack Cloud, which still serves this screen', () => {
		mockIsJetpackCloud = true;
		const next = vi.fn();

		redirectToNewsletter( makeContext(), next );

		expect( replace ).not.toHaveBeenCalled();
		expect( next ).toHaveBeenCalled();
	} );
} );
