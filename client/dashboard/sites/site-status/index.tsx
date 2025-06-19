import { ExternalLink } from '@wordpress/components';
import { useAnalytics } from '../../app/analytics';
import ComponentViewTracker from '../../components/component-view-tracker';
import { getSiteStatusLabel } from '../../utils/site-status';
import type { Site } from '../../data/types';

function ComingSoonStatusLink( {
	href,
	children,
	style,
}: {
	href: string;
	children: React.ReactNode;
	style?: React.CSSProperties;
} ) {
	const { recordTracksEvent } = useAnalytics();

	return (
		<>
			<ComponentViewTracker eventName="calypso_dashboard_site_launch_nag_impression" />
			<ExternalLink
				style={ style }
				href={ href }
				onClick={ () => {
					recordTracksEvent( 'calypso_dashboard_site_launch_nag_click' );
				} }
			>
				{ children }
			</ExternalLink>
		</>
	);
}

export default function SiteStatus( { site, style }: { site: Site; style?: React.CSSProperties } ) {
	const label = getSiteStatusLabel( site );
	if ( site.launch_status !== 'unlaunched' ) {
		return <span style={ style }>{ label }</span>;
	}

	return (
		<ComingSoonStatusLink href={ `/home/${ site.slug }` } style={ style }>
			{ label }
		</ComingSoonStatusLink>
	);
}
