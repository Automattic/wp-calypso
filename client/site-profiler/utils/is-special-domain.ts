const SPECIAL_DOMAIN_RGX = [ /wordpress\.com\/site-profiler/, /localhost/, /127\.0\.0\.1/ ];

export default function isSpecialDomain( domain: string ): boolean {
	const domain_lc = domain.toLowerCase();

	return SPECIAL_DOMAIN_RGX.some( ( pattern ) => pattern.test( domain_lc ) );
}
