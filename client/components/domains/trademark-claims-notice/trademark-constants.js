/**
 * External dependencies
 */
import React, { Fragment } from 'react';

// Note: Please don't change the text in this file as it is specified in the RPM-Requirements of the
// ICANN TMCH functional specifications: https://tools.ietf.org/html/draft-ietf-eppext-tmch-func-spec-01#ref-RPM-Requirements

export const trademarkNoticeText = (
	<Fragment>
		<h3>Trademark Notice</h3>
		<p>
			You have received this Trademark Notice because you have applied for a domain name which
			matches at least one trademark record submitted to the Trademark Clearinghouse.
		</p>
		<p>
			<strong>
				<em>
					You may or may not be entitled to register the domain name depending on your intended use
					and whether it is the same or significantly overlaps with the trademarks listed below.
					Your rights to register this domain name may or may not be protected as noncommercial use
					or “fair use” by the laws of your country.
				</em>
			</strong>
		</p>
		<p>
			Please read the trademark information below carefully, including the trademarks,
			jurisdictions, and goods and services for which the trademarks are registered. Please be aware
			that not all jurisdictions review trademark applications closely, so some of the trademark
			information below may exist in a national or regional registry which does not conduct a
			thorough or substantive review of trademark rights prior to registration. If you have
			questions, you may want to consult an attorney or legal expert on trademarks and intellectual
			property for guidance.
		</p>
		<p>
			If you continue with this registration, you represent that, you have received and you
			understand this notice and to the best of your knowledge, your registration and use of the
			requested domain name will not infringe on the trademark rights listed below. The following
			marks are listed in the Trademark Clearinghouse:
		</p>
	</Fragment>
);

export const trademarkDecisionText = (
	<p>
		This domain name label has previously been found to be used or registered abusively against the
		following trademarks according to the referenced decisions:
	</p>
);
