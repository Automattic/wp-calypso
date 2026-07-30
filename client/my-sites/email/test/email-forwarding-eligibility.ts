import {
	EMAIL_WARNING_CODE_DOMAIN_STATE_RESTRICTED,
	EMAIL_WARNING_CODE_GRAVATAR_DOMAIN,
	EMAIL_WARNING_CODE_OTHER_USER_OWNS_DOMAIN_SUBSCRIPTION,
	EMAIL_WARNING_CODE_OTHER_USER_OWNS_EMAIL,
} from 'calypso/lib/emails/email-provider-constants';
import {
	canPromoteEmailForwarding,
	isEmailForwardingRestricted,
} from 'calypso/my-sites/email/email-forwarding-eligibility';
import type { ResponseDomain } from 'calypso/lib/domains/types';

const domainThatCanAddEmail = { currentUserCanAddEmail: true } as ResponseDomain;

const domainBlockedBy = ( code: string | null ) =>
	( {
		currentUserCanAddEmail: false,
		currentUserCannotAddEmailReason: code ? { code, message: 'Email is unavailable.' } : null,
	} ) as ResponseDomain;

describe( 'isEmailForwardingRestricted', () => {
	it.each( [ EMAIL_WARNING_CODE_DOMAIN_STATE_RESTRICTED, EMAIL_WARNING_CODE_GRAVATAR_DOMAIN ] )(
		'is true for %s, which blocks forwarding itself',
		( code ) => {
			expect( isEmailForwardingRestricted( domainBlockedBy( code ) ) ).toBe( true );
		}
	);

	it.each( [
		EMAIL_WARNING_CODE_OTHER_USER_OWNS_DOMAIN_SUBSCRIPTION,
		EMAIL_WARNING_CODE_OTHER_USER_OWNS_EMAIL,
		'domain-expired',
		null,
	] )( 'is false for %s, which only blocks paid email', ( code ) => {
		expect( isEmailForwardingRestricted( domainBlockedBy( code ) ) ).toBe( false );
	} );

	it( 'is false when the user can add email', () => {
		expect( isEmailForwardingRestricted( domainThatCanAddEmail ) ).toBe( false );
	} );

	it( 'is false without a domain', () => {
		expect( isEmailForwardingRestricted( undefined ) ).toBe( false );
	} );
} );

describe( 'canPromoteEmailForwarding', () => {
	it( 'is true when the user can add email', () => {
		expect( canPromoteEmailForwarding( domainThatCanAddEmail ) ).toBe( true );
	} );

	it( 'is true for a site admin who does not own the domain subscription', () => {
		expect(
			canPromoteEmailForwarding(
				domainBlockedBy( EMAIL_WARNING_CODE_OTHER_USER_OWNS_DOMAIN_SUBSCRIPTION )
			)
		).toBe( true );
	} );

	// Anything else fails closed, including codes this code doesn't recognize and a blocked
	// domain that arrives without a reason at all.
	it.each( [
		EMAIL_WARNING_CODE_OTHER_USER_OWNS_EMAIL,
		EMAIL_WARNING_CODE_DOMAIN_STATE_RESTRICTED,
		EMAIL_WARNING_CODE_GRAVATAR_DOMAIN,
		'domain-expired',
		null,
	] )( 'is false for %s', ( code ) => {
		expect( canPromoteEmailForwarding( domainBlockedBy( code ) ) ).toBe( false );
	} );

	it( 'is false without a domain', () => {
		expect( canPromoteEmailForwarding( undefined ) ).toBe( false );
	} );
} );
