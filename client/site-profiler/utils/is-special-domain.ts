const SPECIAL_DOMAIN_RGX = [ /wordpress\.com\/site-profiler/, /localhost/, /127\.0\.0\.1/ ];

export default function isSpecialDomain( domain: string ): boolean {
	const domain_lc = domain.toLowerCase();

	return SPECIAL_DOMAIN_RGX.some( ( pattern ) => pattern.test( domain_lc ) );
}

export function prepareSpecialDomain( domain: string ) {
	const domain_lc = domain.toLowerCase();

	if ( domain_lc.includes( 'wordpress.com/site-profiler' ) ) {
		return 'wordpress.com/site-profiler';
	} else if ( domain_lc.includes( 'localhost' ) ) {
		return 'localhost';
	} else if ( domain_lc.includes( '127.0.0.1' ) ) {
		return '127.0.0.1';
	}
}
