import { isCallAnHESampledUser } from '../is-call-an-he-sampled-user';

describe( 'isCallAnHESampledUser', () => {
	it( 'samples one user in twenty by id', () => {
		expect( isCallAnHESampledUser( { ID: 20 } ) ).toBe( true );
		expect( isCallAnHESampledUser( { ID: 40, email: 'someone@example.com' } ) ).toBe( true );
	} );

	it( 'leaves the other nineteen out', () => {
		expect( isCallAnHESampledUser( { ID: 21 } ) ).toBe( false );
		expect( isCallAnHESampledUser( { ID: 39, email: 'someone@example.com' } ) ).toBe( false );
	} );

	it( 'samples Automatticians by email, whatever the id', () => {
		expect( isCallAnHESampledUser( { ID: 21, email: 'someone@automattic.com' } ) ).toBe( true );
		expect( isCallAnHESampledUser( { ID: 21, email: 'Someone@Automattic.com' } ) ).toBe( true );
	} );

	it( 'does not take a look-alike domain', () => {
		expect( isCallAnHESampledUser( { ID: 21, email: 'someone@automattic.com.evil.io' } ) ).toBe(
			false
		);
		expect( isCallAnHESampledUser( { ID: 21, email: 'someone@notautomattic.com' } ) ).toBe( false );
	} );

	it( 'never samples a logged-out user', () => {
		expect( isCallAnHESampledUser( undefined ) ).toBe( false );
		expect( isCallAnHESampledUser( {} ) ).toBe( false );
		expect( isCallAnHESampledUser( { ID: 0, email: 'someone@automattic.com' } ) ).toBe( false );
	} );
} );
