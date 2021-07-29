/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';
import QueryJetpackScanThreatCounts from 'calypso/components/data/query-jetpack-scan-threat-counts';
import isRequestingJetpackScan from 'calypso/state/selectors/is-requesting-jetpack-scan';
import isRequestingJetpackScanThreatCounts from 'calypso/state/selectors/is-requesting-jetpack-scan-threat-counts';
import { JetpackBenefitsCard } from 'calypso/blocks/jetpack-benefits/benefit-card';
import { JetpackBenefitsStandaloneCard } from 'calypso/blocks/jetpack-benefits/standalone-benefit-card';
import getSiteScanState from 'calypso/state/selectors/get-site-scan-state';
import getSiteScanProgress from 'calypso/state/selectors/get-site-scan-progress';
import { ProgressBar } from '@automattic/components';

export class JetpackBenefitsScanHistory extends React.Component {
	getThreatsFixedCount() {
		const { threatCounts } = this.props;

		if ( threatCounts ) {
			return threatCounts.fixed;
		}

		return 0;
	}

	renderScanningNow() {
		const { siteScanProgress } = this.props;
		return (
			<JetpackBenefitsCard
				headline="Site Scan"
				description={ <ProgressBar value={ siteScanProgress } total={ 100 } color="#069E08" /> }
				stat="In Progress"
			/>
		);
	}

	renderScanningProvisioning() {
		return (
			<JetpackBenefitsCard
				headline="Site Scan"
				description="Jetpack is preparing to scan your site."
				stat="Preparing"
			/>
		);
	}

	renderScanError() {
		return (
			<JetpackBenefitsCard
				headline="Site Scan"
				description="Jetpack is having trouble scanning your site."
			/>
		);
	}

	renderScanLoading() {
		return (
			<JetpackBenefitsCard
				headline="Site Scan"
				description="Waiting for scan status"
				stat="Loading"
				placeholder={ true }
			/>
		);
	}

	renderScanData() {
		const { siteScanState, requestingScanState, isStandalone } = this.props;

		// site scan state can be provisioning, scanning or idle. If missing from the state after request is ended, can assume an error
		const scanState = siteScanState?.state;

		// scan is running now
		if ( scanState === 'scanning' ) {
			return this.renderScanningNow();
		}

		// scan getting ready to start
		if ( scanState === 'provisioning' ) {
			return this.renderScanningProvisioning();
		}

		// still requesting scan state
		if ( requestingScanState ) {
			return this.renderScanLoading();
		}

		// something went wrong getting the scan state
		if ( ! scanState ) {
			return this.renderScanError();
		}

		const { threats, mostRecent } = siteScanState;
		const mostRecentScanAgo = moment.utc( mostRecent.timestamp ).fromNow();

		// show expended output for standalone scan products
		if ( isStandalone ) {
			return (
				<JetpackBenefitsStandaloneCard
					title="Scan"
					summary={ {
						title: 'Last Scan',
						stat: mostRecentScanAgo,
					} }
					stats={ [
						{
							title: 'Threats Found',
							stat: threats ? threats.length : '...',
						},
						{
							title: 'Threats Fixed (Lifetime)',
							stat: this.getThreatsFixedCount(),
						},
					] }
				/>
			);
		}

		let cardStat = '';
		let cardDescription = '';
		if ( threats.length > 0 ) {
			cardStat = threats.length + ' threat' + ( threats.count > 1 ? 's' : '' ) + ' found';
			cardDescription = 'Jetpack has identified some threats on your site.';
		} else {
			cardStat = this.getThreatsFixedCount() > 0 ? this.getThreatsFixedCount() : mostRecentScanAgo;
			cardDescription =
				this.getThreatsFixedCount > 0
					? 'Security threats fixed by Jetpack'
					: 'Jetpack has recently completed a security scan of your site';
		}

		return (
			<JetpackBenefitsCard headline="Site Scan" description={ cardDescription } stat={ cardStat } />
		);
	}

	render() {
		const { siteId } = this.props;

		return (
			<React.Fragment>
				<QueryJetpackScanThreatCounts siteId={ siteId } />
				{ this.renderScanData() }
			</React.Fragment>
		);
	}
}

export default connect( ( state, { siteId } ) => {
	// maybe these need their own selector methods in /client/state/jetpack-scan
	return {
		requestingThreats: isRequestingJetpackScanThreatCounts( state, siteId ),
		requestingScanState: isRequestingJetpackScan( state, siteId ),
		siteScanState: getSiteScanState( state, siteId ),
		siteScanProgress: getSiteScanProgress( state, siteId ),
		threatCounts: state.jetpackScan.threatCounts?.data?.[ siteId ],
	};
}, {} )( localize( JetpackBenefitsScanHistory ) );
