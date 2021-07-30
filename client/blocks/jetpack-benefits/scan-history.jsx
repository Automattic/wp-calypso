/**
 * External dependencies
 */
import React from 'react';
import { useSelector } from 'react-redux';
import moment from 'moment';

/**
 * Internal dependencies
 */
import QueryJetpackScanThreatCounts from 'calypso/components/data/query-jetpack-scan-threat-counts';
import isRequestingJetpackScan from 'calypso/state/selectors/is-requesting-jetpack-scan';
import isRequestingJetpackScanThreatCounts from 'calypso/state/selectors/is-requesting-jetpack-scan-threat-counts';
import { JetpackBenefitsCard } from 'calypso/blocks/jetpack-benefits/benefit-card';
import { JetpackBenefitsStandaloneCard } from 'calypso/blocks/jetpack-benefits/standalone-benefit-card';
import getSiteScanState from 'calypso/state/selectors/get-site-scan-state';
import getSiteScanProgress from 'calypso/state/selectors/get-site-scan-progress';
import { ProgressBar } from '@automattic/components';
import QueryJetpackScan from 'calypso/components/data/query-jetpack-scan';
import { useTranslate } from 'i18n-calypso';

const JetpackBenefitsScanHistory = ( props ) => {
	const { siteId, isStandalone } = props;
	const translate = useTranslate();
	const siteScanState = useSelector( ( state ) => {
		return getSiteScanState( state, siteId );
	} );
	const siteScanProgress = useSelector( ( state ) => {
		return getSiteScanProgress( state, siteId );
	} );
	const requestingScanState = useSelector( ( state ) => {
		return isRequestingJetpackScan( state, siteId );
	} );
	const requestingThreats = useSelector( ( state ) => {
		return isRequestingJetpackScanThreatCounts( state, siteId );
	} );
	const threatCounts = useSelector( ( state ) => {
		return state?.jetpackScan?.threatCounts?.data?.[ siteId ];
	} );

	// site scan state can be provisioning, scanning or idle. If missing from the state after request is ended, can assume an error
	const scanState = siteScanState?.state;
	const threatsFixedCount = threatCounts ? threatCounts.fixed : 0;

	// scan is running now
	if ( scanState === 'scanning' ) {
		return (
			<JetpackBenefitsCard
				jestMarker="scanning"
				headline={ translate( 'Site Scan' ) }
				description={ <ProgressBar value={ siteScanProgress } total={ 100 } color="#069E08" /> }
				stat={ translate( 'In Progress' ) }
			/>
		);
	}

	// scan getting ready to start
	if ( scanState === 'provisioning' ) {
		return (
			<JetpackBenefitsCard
				jestMarker="provisioning"
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
				jestMarker="loading"
				headline={ translate( 'Site Scan' ) }
				description={ translate( 'Waiting for scan status' ) }
				stat={ translate( 'Loading' ) }
				placeholder={ true }
			/>
		);
	}

	// something went wrong getting the scan state
	if ( ! scanState ) {
		return (
			<JetpackBenefitsCard
				jestMarker="error"
				headline={ translate( 'Site Scan' ) }
				description={ translate( 'Jetpack is having trouble scanning your site.' ) }
			/>
		);
	}

	const { threats, mostRecent } = siteScanState;
	const mostRecentScanAgo = moment.utc( mostRecent.timestamp ).fromNow();

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
						title: translate( 'Threats Found' ),
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

	let cardStat = '';
	let cardDescription = '';
	if ( threats.length > 0 ) {
		cardStat = translate( '%(number)d %(threatMaybePlural)s found', {
			args: {
				number: threats.length,
				threatMaybePlural: 'threat' + threats.count > 1 ? 's' : '',
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
			jestMarker="default"
			headline={ translate( 'Site Scan' ) }
			description={ cardDescription }
			stat={ cardStat }
		/>
	);
};

export default ( props ) => {
	const { siteId } = props;
	return (
		<>
			<QueryJetpackScan siteId={ siteId } />
			<QueryJetpackScanThreatCounts siteId={ siteId } />
			<JetpackBenefitsScanHistory { ...props } />
		</>
	);
};
