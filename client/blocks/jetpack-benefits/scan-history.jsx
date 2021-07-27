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

class JetpackBenefitsScanHistory extends React.Component {
	getThreatsFixedCount() {
		const { threatCounts } = this.props;

		if ( threatCounts ) {
			return threatCounts.fixed;
		}

		return 0;
	}

	getLastScanAgo() {
		const { lastScan, requestingScan } = this.props;

		if ( ! lastScan || requestingScan ) {
			return '...';
		}

		if ( lastScan.progress < 100 && ! lastScan.error ) {
			return 'Scan In Progress';
		}

		return lastScan ? moment.utc( lastScan.timestamp ).fromNow() : 'error checking scan time';
	}

	renderScanData() {
		const { currentThreats, threatCounts, lastScan, isStandalone } = this.props;
		const scanDataAvailable = threatCounts && lastScan;

		// TODO: account for possibility that scan has not been run at all yet
		// Handle Standalone scan products a bit differently
		if ( isStandalone ) {
			return (
				<JetpackBenefitsStandaloneCard
					title="Scan"
					summary={ {
						title: 'Last Scan',
						stat: this.getLastScanAgo(),
					} }
					stats={ [
						{
							title: 'Threats Found',
							stat: currentThreats ? currentThreats.length : 0,
						},
						{
							title: 'Threats Fixed (Lifetime)',
							stat: threatCounts ? threatCounts.fixed : 0,
						},
					] }
				/>
			);
		}

		let cardStat = '...';
		let cardDescription = '';

		if ( scanDataAvailable ) {
			cardStat =
				this.getThreatsFixedCount() > 0 ? this.getThreatsFixedCount() : this.getLastScanAgo();
			cardDescription =
				this.getThreatsFixedCount > 0
					? 'Security threats repaired by Jetpack'
					: 'Jetpacks last scan of your site.';
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
		requestingScan: isRequestingJetpackScan( state, siteId ),
		threatCounts: state.jetpackScan.threatCounts?.data?.[ siteId ],
		lastScan: state.jetpackScan.scan?.[ siteId ]?.mostRecent,
		currentThreats: state.jetpackScan.scan?.[ siteId ]?.threats,
	};
}, {} )( localize( JetpackBenefitsScanHistory ) );
