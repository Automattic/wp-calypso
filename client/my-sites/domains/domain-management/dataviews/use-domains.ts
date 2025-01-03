import { PartialDomainData } from '@automattic/data-stores';

export function getDomainId( domain: PartialDomainData ): string {
	return domain.domain + domain.blog_id;
}
