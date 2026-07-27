import config from '@automattic/calypso-config';
import isDashboardEnv from 'calypso/dashboard/utils/is-dashboard-env';
import { getCalypsoLiveClientConfig } from '..';

jest.mock( '@automattic/calypso-config' );
jest.mock( 'calypso/dashboard/utils/is-dashboard-env' );

const IMAGE_REF = 'registry.a8c.com/calypso/app:build-189947';
const CLASSIC_HOST = 'container-one.calypso.live';
const DASHBOARD_HOST = 'container-two.calypso.live';

function mockEnv( envId: string, isDashboard: boolean ) {
	( config as unknown as jest.Mock ).mockImplementation( ( key: string ) =>
		key === 'env_id' ? envId : undefined
	);
	( isDashboardEnv as jest.Mock ).mockReturnValue( isDashboard );
}

describe( 'getCalypsoLiveClientConfig', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		process.env.CALYPSO_LIVE_IMAGE = IMAGE_REF;
		mockEnv( 'wpcalypso', false );
	} );

	it( 'returns null for non-calypso.live hostnames', () => {
		expect( getCalypsoLiveClientConfig( 'wpcalypso.wordpress.com' ) ).toBeNull();
		expect( getCalypsoLiveClientConfig( undefined ) ).toBeNull();
	} );

	it( 'returns null for the A4A Dashboard, which shares the dashboard env id', () => {
		mockEnv( 'dashboard-horizon', true );
		expect( getCalypsoLiveClientConfig( 'container-three-a4a.calypso.live' ) ).toBeNull();
	} );

	it( 'returns null without a usable CALYPSO_LIVE_IMAGE', () => {
		process.env.CALYPSO_LIVE_IMAGE = '';
		expect( getCalypsoLiveClientConfig( CLASSIC_HOST ) ).toBeNull();

		delete process.env.CALYPSO_LIVE_IMAGE;
		expect( getCalypsoLiveClientConfig( CLASSIC_HOST ) ).toBeNull();
	} );

	it( 'returns null for a commit-pinned ref, which calypso.live cannot resolve', () => {
		process.env.CALYPSO_LIVE_IMAGE =
			'registry.a8c.com/calypso/app:commit-c9300eed5c60017c88ce3f4fa6fe8545f6d53a96';
		expect( getCalypsoLiveClientConfig( CLASSIC_HOST ) ).toBeNull();
	} );

	it( 'returns null for flavours without a dotcom sibling (e.g. Jetpack Cloud)', () => {
		mockEnv( 'jetpack-cloud-stage', false );
		expect( getCalypsoLiveClientConfig( CLASSIC_HOST ) ).toBeNull();
	} );

	it( 'exposes the running image ref', () => {
		expect( getCalypsoLiveClientConfig( CLASSIC_HOST ) ).toEqual( {
			calypso_live_image: IMAGE_REF,
		} );
	} );

	it( 'gives both flavours the same ref, so cross-app links agree', () => {
		const classic = getCalypsoLiveClientConfig( CLASSIC_HOST );

		mockEnv( 'dashboard-horizon', true );
		expect( getCalypsoLiveClientConfig( DASHBOARD_HOST ) ).toEqual( classic );
	} );
} );
