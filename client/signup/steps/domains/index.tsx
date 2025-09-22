import { shouldRenderRewrittenDomainSearch } from 'calypso/lib/domains/should-render-rewritten-domain-search';
import LegacyDomainSearchStep from './legacy';
import RewrittenDomainSearchStep from './rewritten';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function DomainSearchStep( props: any ) {
	return shouldRenderRewrittenDomainSearch() ? (
		<RewrittenDomainSearchStep { ...props } />
	) : (
		<LegacyDomainSearchStep { ...props } />
	);
}
