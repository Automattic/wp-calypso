import { isSshKeyValid } from '../ssh';

describe( 'isSshKeyValid', () => {
	it.each( [
		'ssh-rsa AAAAB3NzaC1yc2E user@host',
		'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5 user@host',
		'ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTY= user@host',
	] )( 'accepts %s', ( key ) => {
		expect( isSshKeyValid( key ) ).toBe( true );
	} );

	it.each( [ '', 'ssh-dss AAAAB3NzaC1kc3M user@host', 'ssh-ed25519' ] )( 'rejects %s', ( key ) => {
		expect( isSshKeyValid( key ) ).toBe( false );
	} );
} );
