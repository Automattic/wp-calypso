import type { SelectResource } from './types';
import type { AgencyEnablementResource } from '@automattic/api-core';

interface ResourceLinkProps {
	resource: AgencyEnablementResource;
	className: string;
	onSelect: SelectResource;
}

/**
 * The link to a resource, styled with a stretched ::after so its card or row is
 * clickable as a whole. A click opens the resource's details; the `href` keeps
 * modified clicks opening the resource itself.
 */
export default function ResourceLink( { resource, className, onSelect }: ResourceLinkProps ) {
	return (
		<a
			className={ className }
			href={ resource.external_url }
			target="_blank"
			rel="noopener noreferrer"
			aria-haspopup="dialog"
			onClick={ ( event ) => onSelect( resource, event ) }
		>
			{ resource.name }
		</a>
	);
}
