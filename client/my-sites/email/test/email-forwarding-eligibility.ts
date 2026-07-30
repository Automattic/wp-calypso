import {
	EMAIL_WARNING_CODE_DOMAIN_STATE_RESTRICTED,
	EMAIL_WARNING_CODE_GRAVATAR_DOMAIN,
	EMAIL_WARNING_CODE_OTHER_USER_OWNS_DOMAIN_SUBSCRIPTION,
	EMAIL_WARNING_CODE_OTHER_USER_OWNS_EMAIL,
} from 'calypso/lib/emails/email-provider-constants';
import {
	canPromoteEmailForwarding,
	getEmailForwardingRestrictionCode,
} from 'calypso/my-sites/email/email-forwarding-eligibility';
import type { ResponseDomain } from 'calypso/lib/domains/types';

const blockedBy = ( code: string | null ) =>
	( {
		currentUserCanAddEmail: false,
		currentUserCannotAddEmailReason: code ? { code, message: 'Email is unavailable.' } : null,
	} ) as ResponseDomain;

// Forwarding restrictions and paid-email eligibility are deliberately different questions: only
// the first two codes stop forwarding, while only domain-subscription ownership is a paid-email
// blocker that still permits it. Anything unrecognized fails closed on both counts.
const cases: [ string, ResponseDomain | undefined, string | null, boolean ][] = [
	[ 'can add email', { currentUserCanAddEmail: true } as ResponseDomain, null, true ],
	[
		EMAIL_WARNING_CODE_DOMAIN_STATE_RESTRICTED,
		blockedBy( EMAIL_WARNING_CODE_DOMAIN_STATE_RESTRICTED ),
		EMAIL_WARNING_CODE_DOMAIN_STATE_RESTRICTED,
		false,
	],
	[
		EMAIL_WARNING_CODE_GRAVATAR_DOMAIN,
		blockedBy( EMAIL_WARNING_CODE_GRAVATAR_DOMAIN ),
		EMAIL_WARNING_CODE_GRAVATAR_DOMAIN,
		false,
	],
	[
		EMAIL_WARNING_CODE_OTHER_USER_OWNS_DOMAIN_SUBSCRIPTION,
		blockedBy( EMAIL_WARNING_CODE_OTHER_USER_OWNS_DOMAIN_SUBSCRIPTION ),
		null,
		true,
	],
	[
		EMAIL_WARNING_CODE_OTHER_USER_OWNS_EMAIL,
		blockedBy( EMAIL_WARNING_CODE_OTHER_USER_OWNS_EMAIL ),
		null,
		false,
	],
	[ 'an unrecognized code', blockedBy( 'domain-expired' ), null, false ],
	[ 'no reason at all', blockedBy( null ), null, false ],
	[ 'no domain', undefined, null, false ],
];

describe( 'email forwarding eligibility', () => {
	it.each( cases )(
		'%s: forwarding restriction %s, promotable %s',
		( _label, domain, restrictionCode, canPromote ) => {
			expect( getEmailForwardingRestrictionCode( domain ) ).toBe( restrictionCode );
			expect( canPromoteEmailForwarding( domain ) ).toBe( canPromote );
		}
	);
} );
