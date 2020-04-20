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
import QueryJetpackScan from 'components/data/query-jetpack-scan';
import SecurityIcon from 'landing/jetpack-cloud/components/security-icon';
import StatsFooter from 'landing/jetpack-cloud/components/stats-footer';
import ScanThreats from 'landing/jetpack-cloud/components/scan-threats';
import { isEnabled } from 'config';
import Gridicon from 'components/gridicon';
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import { getSelectedSite, getSelectedSiteSlug } from 'state/ui/selectors';
import getSiteScanState from 'state/selectors/get-site-scan-state';
import { withLocalizedMoment } from 'components/localized-moment';

/**
 * Style dependencies
 */
import './style.scss';

class ScanPage extends Component {
	renderScanOkay() {
		const { siteSlug, moment, lastScanTimestamp } = this.props;

		return (
			<>
				<SecurityIcon />
				<h1 className="scan__header">{ translate( 'Don’t worry about a thing' ) }</h1>
				<p>
					The last Jetpack scan ran <strong>{ moment( lastScanTimestamp ).fromNow() }</strong> and
					everything looked great. <br />
					Run a manual scan now or wait for Jetpack to scan your site later today.
				</p>
				{ isEnabled( 'jetpack-cloud/on-demand-scan' ) && (
					<Button primary href={ `/scan/${ siteSlug }` } className="scan__button">
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
				<h1 className="scan__header">{ translate( 'Preparing to scan' ) }</h1>
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
		return <ScanThreats className="scan__threats" threats={ threats } site={ site } />;
	}

	renderScanError() {
		const { siteSlug } = this.props;

		return (
			<>
				<SecurityIcon icon="scan-error" />
				<h1 className="scan__header">{ translate( 'Something went wrong' ) }</h1>
				<p>
					The scan was unable to process the themes directory and did not completed successfully. In
					order to complete the scan you will need to speak to support who can help determine what
					went wrong.
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
		if ( ! this.props.scanState ) {
			return <div className="scan__is-loading" />;
		}

		const status = this.props.scanState.status;
		if ( status === 'scanning' ) {
			return this.renderScanning();
		}

		if ( status !== 'done' ) {
			return this.renderScanError();
		}

		const threats = this.props.scanState.threats;
		if ( threats && threats.length ) {
			return this.renderThreats();
		}

		return this.renderScanOkay();
	}

	render() {
		return (
			<Main className="scan__main">
				<DocumentHead title="Scanner" />
				<SidebarNavigation />
				<QueryJetpackScan siteId={ this.props.site.ID } />
				<div className="scan__content">{ this.renderScanState() }</div>
				<StatsFooter
					header="Scan Summary"
					stats={ [
						{ name: 'Files', number: 1201 },
						{ name: 'Plugins', number: 4 },
						{ name: 'Themes', number: 3 },
					] }
					noticeText="Failing to plan is planning to fail. Regular backups ensure that should the worst happen, you are prepared. Jetpack Backup has you covered."
					noticeLink="https://jetpack.com/upgrade/backup"
				/>
			</Main>
		);
	}
}

export default connect( state => {
	const site = getSelectedSite( state );
	const siteSlug = getSelectedSiteSlug( state );
	const scanState = getSiteScanState( state, site.ID );

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
