import type { DomainSummary } from '@automattic/api-core';

export const textOverflowStyles = {
	overflowX: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
} as const;

export function getDomainId( domain: DomainSummary ): string {
	return `${ domain.domain }-${ domain.blog_id }`;
}
