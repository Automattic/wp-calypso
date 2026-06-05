import { DotcomPlans } from '@automattic/api-core';
import { hasBackendAccess } from '../backend-access';

describe( 'hasBackendAccess', () => {
	test( 'allows Student plans', () => {
		expect( hasBackendAccess( DotcomPlans.STUDENT ) ).toBe( true );
	} );

	test( 'does not allow lower-tier plans', () => {
		expect( hasBackendAccess( DotcomPlans.PREMIUM ) ).toBe( false );
		expect( hasBackendAccess( undefined ) ).toBe( false );
	} );
} );
