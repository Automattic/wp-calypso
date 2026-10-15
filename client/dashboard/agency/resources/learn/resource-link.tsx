import type { SelectResource } from './types';
import type { AgencyEnablementResource } from '@automattic/api-core';
import type { ComponentProps } from 'react';

interface ResourceLinkProps extends Omit<
	ComponentProps< 'a' >,
	'href' | 'onSelect' | 'resource'
> {
	resource: AgencyEnablementResource;
	onSelect: SelectResource;
}

/**
 * The link to a resource's details. A click opens them in place; the `href`
 * gives modified clicks and copied addresses the same details as a shareable
 * link. By default it's styled with a stretched ::after so its card is
 * clickable as a whole; as the list's item link, DataViews sets its class and
 * content instead.
 */
export default function ResourceLink( {
	resource,
	onSelect,
	className = 'dashboard-resources-learn__link',
	children = resource.name,
	...props
}: ResourceLinkProps ) {
	return (
		<a
			{ ...props }
			className={ className }
			href={ `?resource=${ resource.id }` }
			data-resource-id={ resource.id }
			aria-haspopup="dialog"
			onClick={ ( event ) => onSelect( resource, event ) }
		>
			{ children }
		</a>
	);
}
