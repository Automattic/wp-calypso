export type NationalityType = 'indian_national' | 'foreign_national';

export type TldType = 'uk' | 'in';

/**
 * Determines the verification TLD type from a domain name.
 *
 * Currently only .uk and .in have TLD-specific verification flows.
 * Defaults to 'uk' because the contact verification form is only
 * accessible for domains with verification flags set, and currently
 * only .uk (Nominet) and .in have those flags. If additional TLDs
 * are added, this function should be updated accordingly.
 */
export function getVerificationTldType( domainName: string ): TldType {
	if ( domainName.endsWith( '.in' ) ) {
		return 'in';
	}
	return 'uk';
}

type TranslateFunction = ( text: string ) => string;

/**
 * Returns accepted documents per TLD and nationality type.
 *
 * Accepts a translate function so document names are translatable.
 * Structured as a map so adding more document types later is just
 * appending to the relevant array.
 */
export function getAcceptedDocuments(
	translate: TranslateFunction
): Record< TldType, Record< string, string[] > > {
	return {
		uk: {
			default: [
				translate( 'Valid drivers\u2019 license' ),
				translate( 'Valid national ID cards (for non-UK residents)' ),
				translate( 'Utility bills (last 3 months)' ),
				translate( 'Bank statement (last 3 months)' ),
				translate( 'HMRC tax notification (last 3 months)' ),
			],
		},
		in: {
			indian_national: [ translate( 'Passport' ) ],
			foreign_national: [ translate( 'Passport' ) ],
		},
	};
}
