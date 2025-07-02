export type DomainBadge = 'recommended' | 'best_alternative' | 'available';
export type DomainMatchReason = 'exact_match' | 'most_common_extension';

export interface Domain {
	id: string;
	badges?: DomainBadge[];
	domain: string;
	tld: string;
	originalPrice?: string;
	price: string;
	matchReasons?: DomainMatchReason[];
}
