import { Nav2026ExternalLinkIcon } from './external-link-icon';
import type { Nav2026Item } from './types';

// Link label plus its optional badge and external-link icon. Shared so desktop
// and mobile render the same affordances.
export function Nav2026ItemContent( {
	item,
	badgeClassName,
}: {
	item: Nav2026Item;
	badgeClassName: string;
} ) {
	return (
		<>
			{ item.label }
			{ item.badge && <span className={ badgeClassName }>{ item.badge }</span> }
			{ item.isExternal && <Nav2026ExternalLinkIcon /> }
		</>
	);
}
