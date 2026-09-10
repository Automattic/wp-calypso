import { createInterpolateElement } from '@wordpress/element';
import { sprintf, __ } from '@wordpress/i18n';
import type { ReferralApiResponse } from '@automattic/api-core';

export default function ClientSite( { referral }: { referral: ReferralApiResponse } ) {
	return createInterpolateElement(
		sprintf(
			/* translators: %s is the email address of the client who owns the license. */
			__( '<b>%s</b> owns this' ),
			referral.client.email
		),
		{ b: <strong /> }
	);
}
