/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button } from '@automattic/components';
import { numberFormat, translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getSelectedSite, getSelectedSiteSlug } from 'state/ui/selectors';
import { withLocalizedMoment } from 'components/localized-moment';
import SecurityIcon from 'landing/jetpack-cloud/components/security-icon';
import StatsFooter from 'landing/jetpack-cloud/components/stats-footer';
import { isEnabled } from 'config';

import './style.scss';

class ScanPage extends Component {
	renderScanOkay() {
		const { siteSlug, moment, lastScanTimestamp } = this.props;

		return (
			<>
				<SecurityIcon className="scan__icon" />
				<h1 className="scan__header scan__header--okay">
					{ translate( 'Don’t worry about a thing' ) }
				</h1>
				<p>
					The last Jetpack scan ran <strong>{ moment( lastScanTimestamp ).fromNow() }</strong> and
					everything looked great.
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
		const { threats, site } = this.props;

		return (
			<>
				<h1 className="scan__header">{ translate( 'Your site may be at risk' ) }</h1>
				<p>
					{ translate(
						'The scan found {{strong}}%(threatCount)s{{/strong}} potential threat with {{strong}}%(siteName)s{{/strong}}.',
						'The scan found {{strong}}%(threatCount)s{{/strong}} potential threats with {{strong}}%(siteName)s{{/strong}}.',
						{
							args: {
								siteName: site.name,
								threatCount: numberFormat( threats.length ),
							},
							components: { strong: <strong /> },
							comment:
								'%(threatCount)s represents the number of threats currently identified on the site, and $(siteName)s is the name of the site.',
							count: threats.length,
						}
					) }
					<br />
					{ translate(
						'Please review them below and take action. We are {{a}}here to help{{/a}} if you need us.',
						{
							components: { a: <a href="https://jetpack.com/contact-support/" /> },
							comment: 'The {{a}} tag is a link that goes to a contact support page.',
						}
					) }
				</p>
			</>
		);
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
			<>
				<div className="scan__main">{ this.renderScanState() }</div>
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
			</>
		);
	}
}

export default connect( state => {
	const site = getSelectedSite( state );
	const siteSlug = getSelectedSiteSlug( state );

	// TODO: Get state from actual API.
	const params = new URL( document.location ).searchParams;
	const scanState = params.get( 'scan-state' ) || 'okay';

	// TODO: Get threats from actual API.
	const threats = [
		{
			title: 'Infected core file: wp-config.php',
			details: 'Unexpected string was found in: /htdocs/wp-admin/wp-config.php',
		},
		{
			title: 'Unexpected core file: sx--a4bp.php',
			details: 'Unexpected file sx--a4bp.php contains malicious code and is not part of WordPress.',
		},
	];

	const lastScanTimestamp = Date.now() - 5700000; // 1h 35m.
	const nextScanTimestamp = Date.now() + 5700000;

	return {
		site,
		siteSlug,
		scanState,
		lastScanTimestamp,
		nextScanTimestamp,
		threats,
	};
} )( withLocalizedMoment( ScanPage ) );
