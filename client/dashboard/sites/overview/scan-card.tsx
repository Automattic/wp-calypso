import { useQuery } from '@tanstack/react-query';
import { __, _n, sprintf } from '@wordpress/i18n';
import { shield } from '@wordpress/icons';
import { siteScanQuery } from '../../app/queries/site-scan';
import { useTimeSince } from '../../components/time-since';
import { isSelfHostedJetpackConnected } from '../../utils/site-types';
import OverviewCard from '../overview-card';
import UpsellCard from './upsell-card';
import type { SiteScan } from '../../data/site-scan';
import type { Site } from '../../data/types';

const CARD_PROPS = {
	icon: shield,
	title: __( 'Last scan' ),
	trackId: 'scan',
};

function getScanURL( site: Site ) {
	const domain = isSelfHostedJetpackConnected( site ) ? 'cloud.jetpack.com' : 'wordpress.com';
	return `https://${ domain }/scan/${ site.slug }`;
}

function ScanCardUpsell( { site }: { site: Site } ) {
	return (
		<UpsellCard
			heading={ __( 'Security scans' ) }
			description={ __( 'We guard your site. You run your business.' ) }
			externalLink={ getScanURL( site ) }
			trackId={ CARD_PROPS.trackId }
		/>
	);
}

function ScanCardUnavailable() {
	return (
		<OverviewCard
			{ ...CARD_PROPS }
			heading={ __( 'Unavailable' ) }
			description={ __( 'Requires the Jetpack module' ) }
			variant="disabled"
		/>
	);
}

function ScanCardWithThreats( { site, scan }: { site: Site; scan: SiteScan } ) {
	const threatCount = scan.threats.length;
	const description = sprintf(
		/* translators: %d: number of threats */
		_n( '%d threat found', '%d threats found', threatCount ),
		threatCount
	);

	return (
		<OverviewCard
			{ ...CARD_PROPS }
			heading={ description }
			description={ __( 'Auto fixes are available' ) }
			externalLink={ getScanURL( site ) }
			variant="error"
		/>
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
		<OverviewCard
			{ ...CARD_PROPS }
			heading={ __( 'No threats found' ) }
			description={ description }
			externalLink={ getScanURL( site ) }
			variant="success"
		/>
	);
}

export default function ScanCard( { site }: { site: Site } ) {
	const { data: scan, isLoading } = useQuery( siteScanQuery( site.ID ) );

	if ( ! scan || isLoading ) {
		return <OverviewCard { ...CARD_PROPS } variant="loading" />;
	}

	if ( scan.state === 'unavailable' ) {
		if ( scan.reason === 'wpcom_site' ) {
			return <ScanCardUpsell site={ site } />;
		}

		return <ScanCardUnavailable />;
	}

	if ( scan.threats.length > 0 ) {
		return <ScanCardWithThreats site={ site } scan={ scan } />;
	}

	return <ScanCardNoThreats site={ site } scan={ scan } />;
}
