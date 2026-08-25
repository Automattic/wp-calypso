import {
	EMAIL_WARNING_CODE_DOMAIN_STATE_RESTRICTED,
	EMAIL_WARNING_CODE_GRAVATAR_DOMAIN,
	EMAIL_WARNING_CODE_OTHER_USER_OWNS_DOMAIN_SUBSCRIPTION,
	EMAIL_WARNING_CODE_OTHER_USER_OWNS_EMAIL,
} from 'calypso/lib/emails/email-provider-constants';
import { getEmailForwardingRestrictionCode } from 'calypso/my-sites/email/email-forwarding-eligibility';
import type { ResponseDomain } from 'calypso/lib/domains/types';

const blockedBy = ( code: string | null ) =>
	( {
		currentUserCanAddEmail: false,
		currentUserCannotAddEmailReason: code ? { code, message: 'Email is unavailable.' } : null,
	} ) as ResponseDomain;

describe( 'getEmailForwardingRestrictionCode', () => {
	it.each( [ EMAIL_WARNING_CODE_DOMAIN_STATE_RESTRICTED, EMAIL_WARNING_CODE_GRAVATAR_DOMAIN ] )(
		'reports %s, which blocks forwarding itself',
		( code ) => {
			expect( getEmailForwardingRestrictionCode( blockedBy( code ) ) ).toBe( code );
		}
	);

	// Not being able to buy paid email says nothing about forwarding, so these are not forwarding
	// restrictions. Pages that also require paid-email eligibility check for it themselves.
	it.each( [
		EMAIL_WARNING_CODE_OTHER_USER_OWNS_DOMAIN_SUBSCRIPTION,
		EMAIL_WARNING_CODE_OTHER_USER_OWNS_EMAIL,
		'domain-expired',
		null,
	] )( 'reports no restriction for %s', ( code ) => {
		expect( getEmailForwardingRestrictionCode( blockedBy( code ) ) ).toBeNull();
	} );

	it( 'reports no restriction when the user can add email', () => {
		expect(
			getEmailForwardingRestrictionCode( { currentUserCanAddEmail: true } as ResponseDomain )
		).toBeNull();
	} );

	it( 'reports no restriction without a domain', () => {
		expect( getEmailForwardingRestrictionCode( undefined ) ).toBeNull();
	} );
} );
