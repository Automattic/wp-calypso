import { getSshKeyComment, isSshKeyValid } from '../ssh';

describe( 'isSshKeyValid', () => {
	it.each( [
		'ssh-rsa AAAAB3NzaC1yc2E user@host',
		'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5 user@host',
		'ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTY= user@host',
		'sk-ssh-ed25519@openssh.com AAAAGnNrLXNzaC1lZDI1NTE5QG9wZW5zc2guY29t user@host',
	] )( 'accepts %s', ( key ) => {
		expect( isSshKeyValid( key ) ).toBe( true );
	} );

	it.each( [
		'',
		'ssh-dss AAAAB3NzaC1kc3M user@host',
		'ssh-ed25519',
		'sk-ssh-ed25519@openssh.com',
		'sk-ssh-ed25519@opensshXcom AAAAGnNrLXNzaC1lZDI1NTE5QG9wZW5zc2guY29t user@host',
	] )( 'rejects %s', ( key ) => {
		expect( isSshKeyValid( key ) ).toBe( false );
	} );
} );

describe( 'getSshKeyComment', () => {
	it( 'returns the comment after the key', () => {
		expect( getSshKeyComment( 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5 user@host' ) ).toBe( 'user@host' );
	} );

	it( 'keeps comments with spaces', () => {
		expect( getSshKeyComment( '  ssh-rsa AAAAB3NzaC1yc2E  Work   laptop \n' ) ).toBe(
			'Work laptop'
		);
	} );

	it( 'cuts long comments to the label length limit', () => {
		expect( getSshKeyComment( `ssh-rsa AAAAB3NzaC1yc2E ${ 'a'.repeat( 60 ) }` ) ).toHaveLength(
			50
		);
	} );

	it.each( [ '', 'ssh-rsa AAAAB3NzaC1yc2E', 'not-a-key AAAA user@host' ] )(
		'returns an empty string for %p',
		( key ) => {
			expect( getSshKeyComment( key ) ).toBe( '' );
		}
	);
} );
