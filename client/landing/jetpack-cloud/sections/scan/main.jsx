/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button } from '@automattic/components';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { withLocalizedMoment } from 'components/localized-moment';
import SecurityIcon from 'landing/jetpack-cloud/components/security-icon';
import StatsFooter from 'landing/jetpack-cloud/components/stats-footer';
import { isEnabled } from 'config';

import './style.scss';

class ScanPage extends Component {
	renderScanOkay() {
		const { siteSlug, moment, lastScanTimestamp, nextScanTimestamp } = this.props;

		let nextScanString = translate( 'tomorrow' );
		if ( moment( nextScanTimestamp ).isSame( Date.now(), 'd' ) ) {
			nextScanString = translate( 'later today' );
		}

		return (
			<>
				<SecurityIcon className="scan__icon" />
				<h1 className="scan__header scan__header--okay">
					{ translate( 'Don’t worry about a thing' ) }
				</h1>
				<p>
					{ translate(
						'The last Jetpack scan ran {{strong}}%(time)s{{/strong}} and everything looked great.' +
							' Run a manual scan now or wait for Jetpack to scan your site %(nextScan)s.',
						{
							args: {
								time: moment( lastScanTimestamp ).fromNow(),
								nextScan: nextScanString,
							},
							components: { strong: <strong /> },
						}
					) }
				</p>
				{ isEnabled( 'jetpack-cloud/on-demand-scan' ) && (
					<Button
						primary
						href={ `/scan/${ siteSlug }/?scan-state=scanning` }
						className="scan__button"
					>
						{ translate( 'Scan now' ) }
					</Button>
				) }
			</>
		);
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
	const siteSlug = getSelectedSiteSlug( state );

	// TODO: Get state from actual API.
	const params = new URL( document.location ).searchParams;
	const scanState = params.get( 'scan-state' ) || 'okay';

	const lastScanTimestamp = Date.now() - 5700000; // 1h 35m.
	const nextScanTimestamp = Date.now() + 5700000;

	return {
		siteId,
		siteSlug,
		scanState,
		lastScanTimestamp,
		nextScanTimestamp,
	};
} )( withLocalizedMoment( ScanPage ) );
