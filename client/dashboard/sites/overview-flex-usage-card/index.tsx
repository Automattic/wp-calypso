import { __experimentalVStack as VStack } from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import filesize from 'filesize';
import { useAnalytics } from '../../app/analytics';
import { Card, CardBody, CardHeader } from '../../components/card';
import { SectionHeader } from '../../components/section-header';
import { Stat } from '../../components/stat';
import { useFlexUsage } from './use-flex-usage';
import type { Site } from '@automattic/api-core';

type Props = {
	site: Site;
};

function formatBytes( bytes: number ) {
	return filesize( bytes, { round: 1 } );
}

function formatHours( hours: number ) {
	const rounded = Math.round( hours * 10 ) / 10;
	// translators: %s is the number of hours of compute used
	return sprintf( _n( '%s hr', '%s hrs', rounded === 1 ? 1 : 2 ), rounded );
}

const symbolsBytesPerMonth = {
	B: 'B-month',
	KB: 'KB-month',
	MB: 'MB-month',
	GB: 'GB-month',
	TB: 'TB-month',
	PB: 'PB-month',
	EB: 'EB-month',
	ZB: 'ZB-month',
	YB: 'YB-month',
};

function formatBytesPerMonth( bytes: number ) {
	return filesize( bytes, { round: 1, symbols: symbolsBytesPerMonth } );
}

export default function OverviewFlexUsageCard( { site }: Props ) {
	const { data } = useFlexUsage( site.ID );
	const { recordTracksEvent } = useAnalytics();

	return (
		<Card
			className="dashboard-overview-usage-card"
			onMouseEnter={ () =>
				recordTracksEvent( 'calypso_dashboard_site_overview_flex_usage_card_impression' )
			}
		>
			<CardHeader>
				<SectionHeader title={ __( 'Month-to-date site usage' ) } level={ 3 } />
			</CardHeader>
			<CardBody>
				<VStack spacing={ 4 } alignment="stretch">
					<StorageStat usedBytes={ data.storage.usedBytes } capBytes={ data.storage.capBytes } />
					<BandwidthStat
						usedBytes={ data.bandwidth.usedBytes }
						capBytes={ data.bandwidth.capBytes }
					/>
					<ComputeStat usedHours={ data.compute.usedHours } capHours={ data.compute.capHours } />
				</VStack>
			</CardBody>
		</Card>
	);
}

const MINIMUM_DISPLAYED_USAGE = 2.5;

function StorageStat( { usedBytes, capBytes }: { usedBytes: number; capBytes: number } ) {
	const usagePercent = Math.round( ( ( usedBytes / capBytes ) * 1000 ) / 10 );
	const progressBarValue = Math.max( MINIMUM_DISPLAYED_USAGE, Math.min( usagePercent, 100 ) );
	return (
		<Stat
			density="high"
			strapline={ __( 'Storage' ) }
			metric={ formatBytesPerMonth( usedBytes ) }
			description={ formatBytesPerMonth( capBytes ) }
			progressValue={ progressBarValue }
			progressLabel={ `${ usagePercent }%` }
		/>
	);
}

function BandwidthStat( { usedBytes, capBytes }: { usedBytes: number; capBytes: number } ) {
	const usagePercent = Math.round( ( ( usedBytes / capBytes ) * 1000 ) / 10 );
	const progressBarValue = Math.max( MINIMUM_DISPLAYED_USAGE, Math.min( usagePercent, 100 ) );
	return (
		<Stat
			density="high"
			strapline={ __( 'Bandwidth' ) }
			metric={ formatBytes( usedBytes ) }
			description={ formatBytes( capBytes ) }
			progressValue={ progressBarValue }
			progressLabel={ `${ usagePercent }%` }
		/>
	);
}

function ComputeStat( { usedHours, capHours }: { usedHours: number; capHours: number } ) {
	const usagePercent = Math.round( ( ( usedHours / capHours ) * 1000 ) / 10 );
	const progressBarValue = Math.max( MINIMUM_DISPLAYED_USAGE, Math.min( usagePercent, 100 ) );
	return (
		<Stat
			density="high"
			strapline={ __( 'Compute' ) }
			metric={ formatHours( usedHours ) }
			description={ formatHours( capHours ) }
			progressValue={ progressBarValue }
			progressLabel={ `${ usagePercent }%` }
		/>
	);
}
