import type { AgencyEnablementResource } from '@automattic/api-core';
import type { ComponentProps } from 'react';

interface ResourceLinkProps extends Omit< ComponentProps< 'a' >, 'href' | 'resource' > {
	resource: AgencyEnablementResource;
	onOpen: ( resource: AgencyEnablementResource ) => void;
}

/**
 * The link to a resource, which opens it in a new tab. By default it's styled
 * with a stretched ::after so its card is clickable as a whole; as the list's
 * item link, DataViews sets its class and content instead.
 */
export default function ResourceLink( {
	resource,
	onOpen,
	className = 'dashboard-resources-learn__link',
	children = resource.name,
	...props
}: ResourceLinkProps ) {
	return (
		<a
			{ ...props }
			className={ className }
			href={ resource.external_url }
			target="_blank"
			rel="noreferrer"
			data-resource-id={ resource.id }
			onClick={ () => onOpen( resource ) }
		>
			{ children }
		</a>
	);
}
