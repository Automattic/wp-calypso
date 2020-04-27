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
import ScanPlaceholder from 'landing/jetpack-cloud/components/scan-placeholder';
import StatsFooter from 'landing/jetpack-cloud/components/stats-footer';
import ScanThreats from 'landing/jetpack-cloud/components/scan-threats';
import { Scan } from 'landing/jetpack-cloud/sections/scan/types';
import { isEnabled } from 'config';
import Gridicon from 'components/gridicon';
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import { getSelectedSite, getSelectedSiteSlug } from 'state/ui/selectors';
import getSiteUrl from 'state/sites/selectors/get-site-url';
import getSiteScanState from 'state/selectors/get-site-scan-state';
import { withLocalizedMoment } from 'components/localized-moment';
import contactSupportUrl from 'landing/jetpack-cloud/lib/contact-support-url';
import { recordTracksEvent } from 'state/analytics/actions';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	site: object | null;
	siteSlug: string | null;
	siteUrl: string | null;
	scanState: Scan | null;
	lastScanTimestamp: number;
	nextScanTimestamp: number;
	moment: Function;
	dispatchRecordTracksEvent: Function;
}

class ScanPage extends Component< Props > {
	// @todo: missing copy and design for this state
	renderUnavailable() {
		const { siteSlug } = this.props;

		return (
			<>
				<SecurityIcon icon="scan-error" />
				<h1 className="scan__header">{ 'Scan unavailable' }</h1>
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

	renderScanOkay() {
		const { site, siteSlug, moment, lastScanTimestamp, dispatchRecordTracksEvent } = this.props;

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
					<Button
						primary
						href={ `/scan/${ siteSlug }` }
						className="scan__button"
						onClick={ () =>
							dispatchRecordTracksEvent( 'calypso_scan_run', {
								site_id: site.ID,
							} )
						}
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

	renderScanError() {
		const { site, siteUrl, dispatchRecordTracksEvent } = this.props;

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
					href={ contactSupportUrl( siteUrl, 'error' ) }
					className="scan__button"
					onClick={ () =>
						dispatchRecordTracksEvent( 'calypso_scan_error_contact_support', {
							site_id: site.ID,
						} )
					}
				>
					{ translate( 'Contact Support {{externalIcon/}}', {
						components: { externalIcon: <Gridicon icon="external" size={ 24 } /> },
					} ) }
				</Button>
			</>
		);
	}

	renderScanState() {
		const { site, scanState } = this.props;
		if ( ! scanState ) {
			return <ScanPlaceholder />;
		}

		const { state, mostRecent, threats } = scanState;

		// @todo: missing copy and design for these states
		if ( state === 'unavailable' || state === 'provisioning' ) {
			return this.renderUnavailable();
		}

		if ( state === 'scanning' ) {
			return this.renderScanning();
		}

		const errorFound = !! mostRecent.error;
		const threatsFound = threats.length > 0;

		if ( errorFound && ! threatsFound ) {
			return this.renderScanError();
		}

		if ( threatsFound ) {
			// @todo: we should display somehow that an error happened (design missing)
			return (
				<ScanThreats
					className="scan__threats"
					threats={ threats }
					error={ errorFound }
					site={ site }
				/>
			);
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

export default connect(
	( state ) => {
		const site = getSelectedSite( state );
		const siteUrl = getSiteUrl( state, site.ID );
		const siteSlug = getSelectedSiteSlug( state );
		const scanState = getSiteScanState( state, site.ID );
		const lastScanTimestamp = Date.now() - 5700000; // 1h 35m.
		const nextScanTimestamp = Date.now() + 5700000;

		return {
			site,
			siteUrl,
			siteSlug,
			scanState,
			lastScanTimestamp,
			nextScanTimestamp,
		};
	},
	{ dispatchRecordTracksEvent: recordTracksEvent }
)( withLocalizedMoment( ScanPage ) );
