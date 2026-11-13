import type { DomainSummary } from '@automattic/api-core';

export const textOverflowStyles = {
	overflowX: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
} as const;

// Table cells get a 24px line box from `app/dataviews-overrides.scss`; stacked lines use the 20px one.
export const stackedLinesStyles = {
	lineHeight: 'var( --wpds-typography-line-height-sm, 20px )',
} as const;

export function getDomainId( domain: DomainSummary ): string {
	return `${ domain.domain }-${ domain.blog_id }`;
}
