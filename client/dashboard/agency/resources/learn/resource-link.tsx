import type { SelectResource } from './types';
import type { AgencyEnablementResource } from '@automattic/api-core';

interface ResourceLinkProps {
	resource: AgencyEnablementResource;
	className: string;
	onSelect: SelectResource;
}

/**
 * The link to a resource's details, styled with a stretched ::after so its card
 * or row is clickable as a whole. A click opens them in place; the `href` gives
 * modified clicks and copied addresses the same details as a shareable link.
 */
export default function ResourceLink( { resource, className, onSelect }: ResourceLinkProps ) {
	return (
		<a
			className={ className }
			href={ `?resource=${ resource.id }` }
			data-resource-id={ resource.id }
			aria-haspopup="dialog"
			onClick={ ( event ) => onSelect( resource, event ) }
		>
			{ resource.name }
		</a>
	);
}
