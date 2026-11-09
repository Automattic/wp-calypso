import { getPrimaryDomainErrorMessage } from '../primary-domain-error';

it( 'shows the server message as it is', () => {
	const message =
		"We couldn't make this domain your primary domain. Please try again in a few minutes, or contact support if it keeps happening.";
	expect( getPrimaryDomainErrorMessage( new Error( message ) ) ).toBe( message );
} );

it( 'provides a fallback for an empty message', () => {
	expect( getPrimaryDomainErrorMessage( new Error( '' ) ) ).toBe(
		"Something went wrong and we couldn't change your primary domain."
	);
} );
