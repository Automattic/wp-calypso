import { VisuallyHidden } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import type { OpenResource, ResourceItem } from './types';

interface ResourceLinkProps {
	resource: ResourceItem;
	className: string;
	onOpen: OpenResource;
}

/**
 * The link to a resource, styled with a stretched ::after so its card or row is
 * clickable as a whole. Videos open in the in-portal modal, everything else in
 * a new tab.
 */
export default function ResourceLink( { resource, className, onOpen }: ResourceLinkProps ) {
	return (
		<a
			className={ className }
			href={ resource.externalUrl }
			target="_blank"
			rel="noopener noreferrer"
			onClick={ ( event ) => onOpen( resource, event ) }
		>
			{ resource.name }
			{ resource.format !== 'video' && (
				<VisuallyHidden as="span">
					{
						/* translators: accessibility text */
						__( '(opens in a new tab)' )
					}
				</VisuallyHidden>
			) }
		</a>
	);
}
