import { useQuery } from '@tanstack/react-query';
import { __, _n, sprintf } from '@wordpress/i18n';
import { shield } from '@wordpress/icons';
import { siteScanQuery } from '../../app/queries/site-scan';
import { useTimeSince } from '../../components/time-since';
import { isSelfHostedJetpackConnected } from '../../utils/site-types';
import { HostingFeatures } from '../features';
import HostingFeatureGatedWithOverviewCard from '../hosting-feature-gated-with-overview-card';
import { OverviewCardWithLink, OverviewCardWithPlaceholder } from '../overview-card';
import { OverviewCardExtenalLinkIcon } from '../overview-card/link';
import OverviewCardSummary from '../overview-card/summary';
import type { SiteScan } from '../../data/site-scan';
import type { Site } from '../../data/types';

const CARD_PROPS = {
	icon: shield,
	title: __( 'Last scan' ),
	tracksId: 'scan',
};

function getScanURL( site: Site ) {
	return isSelfHostedJetpackConnected( site )
		? `https://cloud.jetpack.com/scan/${ site.slug }`
		: `https://wordpress.com/scan/${ site.slug }`;
}

function ScanCardWithThreats( { site, scan }: { site: Site; scan: SiteScan } ) {
	const threatCount = scan.threats.length;
	const description = sprintf(
		/* translators: %d: number of risks */
		_n( '%d risk found', '%d risks found', threatCount ),
		threatCount
	);

	return (
		<OverviewCardWithLink
			link={ getScanURL( site ) }
			tracksId={ CARD_PROPS.tracksId }
			variant="error"
			isExternal
		>
			<OverviewCardSummary
				{ ...CARD_PROPS }
				heading={ description }
				description={ __( 'Auto fixes are available' ) }
				linkIcon={ <OverviewCardExtenalLinkIcon /> }
			/>
		</OverviewCardWithLink>
	);
}

function ScanCardNoThreats( { site, scan }: { site: Site; scan: SiteScan } ) {
	const lastScanDate = useTimeSince( scan.most_recent?.timestamp );
	let description = '\u00A0';

	if ( lastScanDate ) {
		description = sprintf(
			/* translators: %s: time since last scan */
			__( 'Scanned %s' ),
			lastScanDate
		);
	}

	return (
		<OverviewCardWithLink
			link={ getScanURL( site ) }
			tracksId={ CARD_PROPS.tracksId }
			variant="success"
			isExternal
		>
			<OverviewCardSummary
				{ ...CARD_PROPS }
				heading={ __( 'No risks found' ) }
				description={ description }
				linkIcon={ <OverviewCardExtenalLinkIcon /> }
			/>
		</OverviewCardWithLink>
	);
}

function ScanCardContent( { site }: { site: Site } ) {
	const { data: scan } = useQuery( siteScanQuery( site.ID ) );

	if ( scan === undefined ) {
		return <OverviewCardWithPlaceholder title={ CARD_PROPS.title } icon={ CARD_PROPS.icon } />;
	}

	if ( ! scan ) {
		return null;
	}

	if ( scan.threats.length > 0 ) {
		return <ScanCardWithThreats site={ site } scan={ scan } />;
	}

	return <ScanCardNoThreats site={ site } scan={ scan } />;
}

export default function ScanCard( { site }: { site: Site } ) {
	return (
		<HostingFeatureGatedWithOverviewCard
			site={ site }
			feature={ HostingFeatures.SCAN }
			featureIcon={ CARD_PROPS.icon }
			tracksFeatureId={ CARD_PROPS.tracksId }
			upsellHeading={ __( 'Scan for security threats' ) }
			upsellDescription={ __( 'We guard your site. You run your business.' ) }
			upsellExternalLink={ getScanURL( site ) }
		>
			<ScanCardContent site={ site } />
		</HostingFeatureGatedWithOverviewCard>
	);
}
