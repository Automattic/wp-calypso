import { getPrimaryDomainErrorMessage } from '../primary-domain-error';

const conflictCopy =
	'This domain is already in use on another WordPress.com or WP Cloud site. Remove it from the originating site, or contact support to set up TXT record verification.';

it.each( [
	'Domain already used on a different site [example.com].',
	'Domain name already used [example.com]. TXT record verification is required to bypass this check.',
	'Setting domain-as-primary failed: Domain name already used [example.com].',
	'TXT record verification is required to bypass this check.',
] )( 'explains the conflict for %s', ( message ) => {
	expect( getPrimaryDomainErrorMessage( message ) ).toBe( conflictCopy );
} );

it( 'preserves unrelated Atomic failures', () => {
	expect( getPrimaryDomainErrorMessage( 'Unable to reach the hosting service.' ) ).toBe(
		'Unable to reach the hosting service.'
	);
} );

it( 'provides a fallback for an empty message', () => {
	expect( getPrimaryDomainErrorMessage( '' ) ).toBe(
		"Something went wrong and we couldn't change your primary domain."
	);
} );
