export type DomainBadge = 'recommended' | 'best_alternative';

export interface Domain {
	id: string;
	badges?: DomainBadge[];
	domain: string;
	tld: string;
	originalPrice?: string;
	price: string;
}
