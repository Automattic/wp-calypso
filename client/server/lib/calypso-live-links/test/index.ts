import config from '@automattic/calypso-config';
import isDashboardEnv from 'calypso/dashboard/utils/is-dashboard-env';
import { getCalypsoLiveUrlOverrides } from '..';

jest.mock( '@automattic/calypso-config' );
jest.mock( 'calypso/dashboard/utils/is-dashboard-env' );

const VALID_SHA = 'c9300eed5c60017c88ce3f4fa6fe8545f6d53a96';
const IMAGE_REF = `registry.a8c.com/calypso/app:commit-${ VALID_SHA }`;
const CLASSIC_HOST = 'container-one.calypso.live';
const DASHBOARD_HOST = 'container-two.calypso.live';

function mockEnv( envId: string, isDashboard: boolean ) {
	( config as unknown as jest.Mock ).mockImplementation( ( key: string ) =>
		key === 'env_id' ? envId : undefined
	);
	( isDashboardEnv as jest.Mock ).mockReturnValue( isDashboard );
}

describe( 'getCalypsoLiveUrlOverrides', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		process.env.COMMIT_SHA = VALID_SHA;
		mockEnv( 'wpcalypso', false );
	} );

	it( 'returns null for non-calypso.live hostnames', () => {
		expect( getCalypsoLiveUrlOverrides( 'wpcalypso.wordpress.com' ) ).toBeNull();
		expect( getCalypsoLiveUrlOverrides( undefined ) ).toBeNull();
	} );

	it( 'returns null for non-dotcom calypso.live hostnames', () => {
		expect( getCalypsoLiveUrlOverrides( 'container-one-ciab.calypso.live' ) ).toBeNull();
		expect( getCalypsoLiveUrlOverrides( 'container-one-a4a.calypso.live' ) ).toBeNull();
		expect( getCalypsoLiveUrlOverrides( 'container-one-jetpack.calypso.live' ) ).toBeNull();
	} );

	it( 'returns null without a usable COMMIT_SHA', () => {
		process.env.COMMIT_SHA = '(unknown)';
		expect( getCalypsoLiveUrlOverrides( CLASSIC_HOST ) ).toBeNull();

		delete process.env.COMMIT_SHA;
		expect( getCalypsoLiveUrlOverrides( CLASSIC_HOST ) ).toBeNull();
	} );

	it( 'returns null for flavours without a dotcom sibling (e.g. Jetpack Cloud)', () => {
		mockEnv( 'jetpack-cloud-stage', false );
		expect( getCalypsoLiveUrlOverrides( CLASSIC_HOST ) ).toBeNull();
	} );

	it( 'points both app URLs at the redirector, pinned to the running image', () => {
		const overrides = getCalypsoLiveUrlOverrides( CLASSIC_HOST );

		const wpcomUrl = new URL( overrides?.wpcom_url ?? '' );
		expect( wpcomUrl.origin ).toBe( 'https://calypso.live' );
		expect( wpcomUrl.searchParams.get( 'image' ) ).toBe( IMAGE_REF );
		expect( wpcomUrl.searchParams.get( 'env' ) ).toBeNull();

		const dashboardUrl = new URL( overrides?.dashboard_url ?? '' );
		expect( dashboardUrl.origin ).toBe( 'https://calypso.live' );
		expect( dashboardUrl.searchParams.get( 'image' ) ).toBe( IMAGE_REF );
		expect( dashboardUrl.searchParams.get( 'env' ) ).toBe( 'dashboard' );
	} );

	it( 'gives both flavours the same overrides, so cross-app links agree', () => {
		const classic = getCalypsoLiveUrlOverrides( CLASSIC_HOST );

		mockEnv( 'dashboard-horizon', true );
		expect( getCalypsoLiveUrlOverrides( DASHBOARD_HOST ) ).toEqual( classic );
	} );
} );
