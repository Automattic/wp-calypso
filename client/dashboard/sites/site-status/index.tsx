import { ExternalLink } from '@wordpress/components';
import { useAnalytics } from '../../app/analytics';
import ComponentViewTracker from '../../components/component-view-tracker';
import { getSiteStatusLabel } from '../../utils/site-status';
import type { Site } from '../../data/types';

function ComingSoonStatusButton( { href, children }: { href: string; children: React.ReactNode } ) {
	const { recordTracksEvent } = useAnalytics();

	return (
		<>
			<ComponentViewTracker eventName="calypso_dashboard_site_launch_nag_impression" />
			<ExternalLink
				href={ href }
				onClick={ () => {
					recordTracksEvent( 'calypso_dashboard_site_launch_nag_click' );
				} }
				// The dataview's field value container uses `overflow:hidden` to prevent any of the fields
				// from overflowing. This hack ensures that the link's focus ring isn't obscured.
				style={ {
					display: 'inline-block',
					maxWidth: 'calc(100% - 4px)',
					margin: '0 2px',
					overflow: 'hidden',
					whiteSpace: 'nowrap',
					textOverflow: 'ellipsis',
				} }
			>
				{ children }
			</ExternalLink>
		</>
	);
}

export default function SiteStatus( { site }: { site: Site } ) {
	const label = getSiteStatusLabel( site );
	if ( site.launch_status !== 'unlaunched' ) {
		return label;
	}

	return <ComingSoonStatusButton href={ `/home/${ site.slug }` }>{ label }</ComingSoonStatusButton>;
}
