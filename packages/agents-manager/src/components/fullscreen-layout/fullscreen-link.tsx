import { useAgentsManagerContext } from '../../contexts';
import { useSitePanel } from '../../hooks/use-site-panel';
import { getSitePanelItem } from '../../utils/site-panel-content';
import { recordAgentsManagerTracksEvent } from '../../utils/tracks';
import { uriTransformer } from '../../utils/uri-transformer';
import CustomALink from '../custom-a-link';

export function FullscreenLink( {
	children,
	href,
	...props
}: React.AnchorHTMLAttributes< HTMLAnchorElement > ) {
	const { site } = useAgentsManagerContext();
	const panel = useSitePanel();
	const item =
		site && href ? getSitePanelItem( href, site.URL || `https://${ site.domain }` ) : undefined;
	if ( ! item ) {
		return (
			<CustomALink { ...props } href={ href } openInNewTab>
				{ children }
			</CustomALink>
		);
	}
	return (
		<a
			{ ...props }
			href={ uriTransformer( item.url ) }
			target="_blank"
			rel="noopener noreferrer"
			onClick={ ( event ) => {
				if (
					event.button !== 0 ||
					event.metaKey ||
					event.ctrlKey ||
					event.shiftKey ||
					event.altKey
				) {
					return;
				}
				event.preventDefault();
				recordAgentsManagerTracksEvent( 'calypso_agents_manager_link_click', {
					href: item.url,
					link_type: 'external',
					source: 'orchestrator',
				} );
				const title = event.currentTarget.textContent?.trim();
				void panel.open( title ? { ...item, title, hasTitle: true } : item );
			} }
		>
			{ children }
		</a>
	);
}
