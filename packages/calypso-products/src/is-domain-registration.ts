export function isDomainRegistration( product: {
	is_domain_registration?: boolean;
	isDomainRegistration?: boolean;
} ): boolean {
	return !! ( product.is_domain_registration || product.isDomainRegistration );
}
