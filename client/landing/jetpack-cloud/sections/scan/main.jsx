/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, ProgressBar } from '@automattic/components';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import SecurityIcon from 'landing/jetpack-cloud/components/security-icon';
import StatsFooter from 'landing/jetpack-cloud/components/stats-footer';
import ScanThreats from 'landing/jetpack-cloud/components/scan-threats';
import { isEnabled } from 'config';
import Gridicon from 'components/gridicon';
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import { getSelectedSite, getSelectedSiteSlug } from 'state/ui/selectors';
import { withLocalizedMoment } from 'components/localized-moment';

import './style.scss';

class ScanPage extends Component {
	renderScanOkay() {
		const { siteSlug, moment, lastScanTimestamp } = this.props;

		return (
			<>
				<SecurityIcon />
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
		return (
			<>
				<SecurityIcon icon="in-progress" />
				<h1 className="scan__header scan__header--okay">{ translate( 'Preparing to scan' ) }</h1>
				<ProgressBar value={ 1 } total={ 100 } color="#069E08" />
				<p>
					Welcome to Jetpack Scan, we are taking a first look at your site now and the results will
					be with you soon.
				</p>
				<p>
					We will send you an email once the scan completes, in the meantime feel free to continue
					to use your site as normal, you can check back on progress at any time.
				</p>
			</>
		);
	}

	renderThreats() {
		const { threats, site } = this.props;
		return (
			<>
				<SecurityIcon icon="error" />
				<ScanThreats className="scan__threats" threats={ threats } site={ site } />
			</>
		);
	}

	renderScanError() {
		const { siteSlug } = this.props;

		return (
			<>
				<SecurityIcon icon="scan-error" />
				<h1 className="scan__header">{ translate( 'Something went wrong' ) }</h1>
				<p>
					The scan did not complete successfully. In order to complete the scan you need to contact
					support.
				</p>
				<Button
					primary
					target="_blank"
					rel="noopener noreferrer"
					href={ `https://jetpack.com/contact-support/?scan-state=error&site-slug=${ siteSlug }` }
					className="scan__button"
				>
					{ translate( 'Contact Support {{externalIcon/}}', {
						components: { externalIcon: <Gridicon icon="external" size={ 24 } /> },
					} ) }
				</Button>
			</>
		);
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
			<Main wideLayout className="scan__main">
				<DocumentHead title="Scanner" />
				<SidebarNavigation />
				<div className="scan__content">{ this.renderScanState() }</div>
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
			</Main>
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
			id: 1,
			title: 'Infected core file: index.php',
			action: null,
			detectionDate: '23 September, 2019',
			actionDate: null,
			description: {
				title: 'Unexpected string was found in: /htdocs/wp-admin/index.php',
				problem:
					'Jetpack has detected code that is often used in web-based "shell" programs. If you believe the file(s) have been infected they need to be cleaned.',
				fix:
					'To fix this threat, Jetpack will be deleting the file, since it’s not a part of the original WordPress.',
				details: 'This threat was found in the file: /htdocs/index.php',
			},
		},
		{
			id: 2,
			title: 'Infected Plugin: Contact Form 7',
			action: null,
			detectionDate: '17 September, 2019',
			actionDate: null,
			description: {
				title:
					'Unexpected file baaaaaad--file.php contains malicious code and is not part of the Plugin',
				problem:
					'Jetpack has detected code that is often used in web-based "shell" programs. If you believe the file(s) have been infected they need to be cleaned.',
				fix:
					'To fix this threat, Jetpack will be deleting the file, since it’s not a part of the original WordPress.',
				details: 'This threat was found in the file: /htdocs/sx--a4bp.php',
			},
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
