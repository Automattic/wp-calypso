/**
 * @jest-environment jsdom
 */
import { SiteExcerptData } from '@automattic/sites';
import { isActionEligible } from 'calypso/sites/components/sites-dataviews/actions';

jest.mock( 'calypso/state/analytics/actions', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

jest.mock( 'calypso/state/notices/actions', () => ( {
	errorNotice: jest.fn(),
	successNotice: jest.fn(),
} ) );

jest.mock( 'calypso/state', () => ( {
	useSelector: jest.fn(),
	useDispatch: jest.fn(),
} ) );

jest.mock( 'calypso/sites/hooks/use-restore-site-mutation', () =>
	jest.fn( () => ( {
		mutate: jest.fn(),
	} ) )
);

jest.mock( '@tanstack/react-query', () => ( {
	useQueryClient: jest.fn( () => ( {
		invalidateQueries: jest.fn(),
	} ) ),
} ) );

describe( 'isActionEligible', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	const siteMock = {
		ID: 1,
		options: {
			is_wpforteams_site: false,
		},
	} as SiteExcerptData;
	const capabilitiesMock = { 1: { manage_options: true } };

	it.each( [
		'site-overview',
		'launch-site',
		'prepare-for-launch',
		'hosting',
		'site-monitoring',
		'plugins',
		'copy-site',
		'performance-settings',
		'domains-and-dns',
		'jetpack-cloud',
		'jetpack-billing',
		'jetpack-support',
		'migrate-to-wpcom',
	] )( '%s action is hidden for P2 site', ( action ) => {
		const result = isActionEligible( action, capabilitiesMock );

		const site = {
			...siteMock,
			options: {
				is_wpforteams_site: true,
			},
		} as SiteExcerptData;

		expect( result( site ) ).toEqual( false );
	} );

	it.each( [
		'site-overview',
		'launch-site',
		'prepare-for-launch',
		'settings',
		'general-settings',
		'hosting',
		'site-monitoring',
		'plugins',
		'copy-site',
		'performance-settings',
		'privacy-settings',
		'domains-and-dns',
		'restore',
		'jetpack-cloud',
		'jetpack-billing',
		'jetpack-support',
		'migrate-to-wpcom',
	] )( '%s action is hidden for non-admin users', ( action ) => {
		const result = isActionEligible( action, { 1: { manage_options: false } } );

		const site = {
			...siteMock,
		} as SiteExcerptData;

		expect( result( site ) ).toEqual( false );
	} );

	it.each( [ 'jetpack-cloud', 'jetpack-billing', 'jetpack-support', 'migrate-to-wpcom' ] )(
		'%s action is shown for non-Atomic Jetpack sites',
		( action ) => {
			const result = isActionEligible( action, capabilitiesMock );

			const site = {
				...siteMock,
				jetpack: true,
				is_wpcom_atomic: false,
			} as SiteExcerptData;

			expect( result( site ) ).toEqual( true );
		}
	);

	it.each( [ 'migrate-to-wpcom' ] )(
		'%s action is shown for Jetpack disconnected non-Atomic sites',
		( action ) => {
			const result = isActionEligible( action, capabilitiesMock );

			const site = {
				...siteMock,
				jetpack: false,
				is_wpcom_atomic: false,
				jetpack_connection: true,
			} as SiteExcerptData;

			expect( result( site ) ).toEqual( true );
		}
	);
} );
