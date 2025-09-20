import { wpcom } from '../wpcom-fetcher';

export function domainContactVerification(
	domain: string,
	formData: [ string, File, string ][]
): Promise< void > {
	return wpcom.req.post( {
		path: `/domains/${ domain }/contact-verification`,
		apiVersion: '1.1',
		formData,
	} );
}
