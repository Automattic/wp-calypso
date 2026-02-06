import { wpcom } from '../wpcom-fetcher';

export function domainContactVerification(
	domain: string,
	formData: [ string, File, string ][],
	verificationType?: string
): Promise< void > {
	const allFormData: [ string, string | File, string? ][] = [ ...formData ];
	if ( verificationType ) {
		allFormData.push( [ 'verification_type', verificationType ] );
	}
	return wpcom.req.post( {
		path: `/domains/${ domain }/contact-verification`,
		apiVersion: '1.1',
		formData: allFormData,
	} );
}
