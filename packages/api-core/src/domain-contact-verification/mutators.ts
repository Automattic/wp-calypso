import { wpcom } from '../wpcom-fetcher';

export function domainContactVerification(
	domain: string,
	formData: [ string, File, string ][],
	metadata?: { nationalityType?: 'indian_national' | 'foreign_national' }
): Promise< void > {
	const allFormData: ( [ string, File, string ] | [ string, string ] )[] = [ ...formData ];

	if ( metadata?.nationalityType ) {
		allFormData.push( [ 'nationality_type', metadata.nationalityType ] );
	}

	return wpcom.req.post( {
		path: `/domains/${ domain }/contact-verification`,
		apiVersion: '1.1',
		formData: allFormData,
	} );
}
