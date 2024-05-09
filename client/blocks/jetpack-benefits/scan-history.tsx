import { ProgressBar } from '@automattic/components';
import { TranslateResult, useTranslate } from 'i18n-calypso';
import * as React from 'react';
import { JetpackBenefitsCard } from 'calypso/blocks/jetpack-benefits/benefit-card';
import { JetpackBenefitsStandaloneCard } from 'calypso/blocks/jetpack-benefits/standalone-benefit-card';
import QueryJetpackScan from 'calypso/components/data/query-jetpack-scan';
import QueryJetpackScanThreatCounts from 'calypso/components/data/query-jetpack-scan-threat-counts';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { useSelector } from 'calypso/state';
import getSiteScanProgress from 'calypso/state/selectors/get-site-scan-progress';
import getSiteScanState from 'calypso/state/selectors/get-site-scan-state';
import isRequestingJetpackScan from 'calypso/state/selectors/is-requesting-jetpack-scan';
import isRequestingJetpackScanThreatCounts from 'calypso/state/selectors/is-requesting-jetpack-scan-threat-counts';
import type { AppState } from 'calypso/types';

interface Props {
	siteId: number;
	isStandalone: boolean;
}

const JetpackBenefitsScanHistory: React.FC< Props > = ( { siteId, isStandalone } ) => {
	const translate = useTranslate();
	const moment = useLocalizedMoment();
	const siteScanState = useSelector( ( state ) => getSiteScanState( state, siteId ) );
	const siteScanProgress = useSelector( ( state ) => getSiteScanProgress( state, siteId ) );
	const requestingScanState = useSelector( ( state ) => isRequestingJetpackScan( state, siteId ) );
	const requestingThreats = useSelector( ( state ) =>
		isRequestingJetpackScanThreatCounts( state, siteId )
	);
	const threatCounts = useSelector(
		( state: AppState ) => state?.jetpackScan?.threatCounts?.data?.[ siteId ]
	);

	// site scan state can be provisioning, scanning or idle. If missing from the state after request is ended, can assume an error
	const scanState = siteScanState?.state;
	const threatsFixedCount = threatCounts ? threatCounts.fixed : 0;

	// scan is running now
	if ( scanState === 'scanning' ) {
		return (
			<JetpackBenefitsCard
				headline={ translate( 'Site Scan' ) }
				description={
					<ProgressBar value={ siteScanProgress ?? 0 } total={ 100 } color="#069E08" />
				}
				stat={ translate( 'In Progress' ) }
			/>
		);
	}

	// scan getting ready to start
	if ( scanState === 'provisioning' ) {
		return (
			<JetpackBenefitsCard
				headline={ translate( 'Site Scan' ) }
				description={ translate( 'Jetpack is preparing to scan your site.' ) }
				stat="Preparing"
			/>
		);
	}

	// still requesting scan state
	if ( requestingScanState ) {
		return (
			<JetpackBenefitsCard
				headline={ translate( 'Site Scan' ) }
				description={ translate( 'Waiting for scan status' ) }
				stat={ translate( 'Loading' ) }
				placeholder
			/>
		);
	}

	// something went wrong getting the scan state
	if ( ! scanState ) {
		return (
			<JetpackBenefitsCard
				headline={ translate( 'Site Scan' ) }
				description={ translate( 'Jetpack is having trouble scanning your site.' ) }
			/>
		);
	}

	const { threats, mostRecent } = siteScanState;

	// there is no most recent scan - for some reason, scan has not run yet
	if ( ! mostRecent ) {
		return (
			<JetpackBenefitsCard
				headline={ translate( 'Site Scan' ) }
				description={ translate( 'Jetpack will scan your site for threats soon.' ) }
				stat="Scheduled"
			/>
		);
	}

	const mostRecentScanAgo = mostRecent ? moment.utc( mostRecent.timestamp ).fromNow() : '';

	// show expended output for standalone scan products
	if ( isStandalone ) {
		return (
			<JetpackBenefitsStandaloneCard
				title={ translate( 'Site Scan' ) }
				summary={ {
					title: translate( 'Last Scan' ),
					stat: mostRecentScanAgo,
				} }
				stats={ [
					{
						title: translate( 'Malware Threats Found' ),
						stat: threats ? threats.length : '...',
					},
					{
						title: translate( 'Threats Fixed (Lifetime)' ),
						stat: requestingThreats ? '...' : threatsFixedCount,
					},
				] }
			/>
		);
	}

	let cardStat: TranslateResult = '';
	let cardDescription: TranslateResult = '';
	if ( threats && threats.length > 0 ) {
		cardStat = translate( '%(threatCount)d threat found', '%(threatCount)d threats found', {
			count: threats.length,
			args: {
				threatCount: threats.length,
			},
		} );
		cardDescription = translate( 'Jetpack has identified some threats on your site.' );
	} else {
		cardStat = threatsFixedCount > 0 ? threatsFixedCount : mostRecentScanAgo;
		cardDescription =
			threatsFixedCount > 0
				? translate( 'Security threats fixed by Jetpack' )
				: translate( 'Jetpack has recently completed a security scan of your site' );
	}

	return (
		<JetpackBenefitsCard
			headline={ translate( 'Site Scan' ) }
			description={ cardDescription }
			stat={ cardStat }
		/>
	);
};

export default ( props: Props ) => {
	const { siteId } = props;
	return (
		<>
			<QueryJetpackScan siteId={ siteId } />
			<QueryJetpackScanThreatCounts siteId={ siteId } />
			<JetpackBenefitsScanHistory { ...props } />
		</>
	);
};
