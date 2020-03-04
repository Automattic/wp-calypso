/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import StatsFooter from 'landing/jetpack-cloud/components/stats-footer';
import { getSelectedSiteId } from 'state/ui/selectors';

class ScanPage extends Component {
	renderScanOkay() {
		return <p>Everything is okay!</p>;
	}

	renderScanning() {
		return <p>Scanning!</p>;
	}

	renderThreats() {
		return <p>Threats found.</p>;
	}

	renderScanError() {
		return <p>There is an error with the scan.</p>;
	}

	renderScanState() {
		switch ( this.props.scanState ) {
			case 'okay':
				return this.renderScanOkay();
			case 'scanning':
				return this.renderScanning();
			case 'threats':
				return this.renderThreats();
			case 'error':
				return this.renderScanError();
		}
	}

	render() {
		return (
			<div>
				Welcome to the scan page for site { this.props.siteId }
				{ this.renderScanState() }
				<StatsFooter
					header="Scan Summary"
					stats={ [
						{ name: 'Files', number: 1201 },
						{ name: 'Plugins', number: 4 },
						{ name: 'Themes', number: 3 },
					] }
					noticeText="Failing to plan is planning to fail. Regular backups ensure that should the worst happen, you are prepared. Jetpack Backups has you covered."
					noticeLink="https://jetpack/upgrade/backups"
				/>
			</div>
		);
	}
}

export default connect( state => {
	const siteId = getSelectedSiteId( state );

	// TODO: Get state from actual API.
	const params = new URL( document.location ).searchParams;
	const scanState = params.get( 'scan-state' ) || 'okay';

	return {
		siteId,
		scanState,
	};
} )( ScanPage );
