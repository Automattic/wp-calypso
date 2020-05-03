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
import PageViewTracker from 'lib/analytics/page-view-tracker';
import { getSelectedSite, getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import getSiteUrl from 'state/sites/selectors/get-site-url';
import getSiteScanProgress from 'state/selectors/get-site-scan-progress';
import getSiteScanIsInitial from 'state/selectors/get-site-scan-is-initial';
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
	siteID: number | null;
	siteSlug: string | null;
	siteUrl: string | null;
	scanState: Scan | null;
	scanProgress?: number;
	isInitialScan: boolean;
	lastScanTimestamp: number;
	nextScanTimestamp: number;
	moment: Function;
	dispatchRecordTracksEvent: Function;
}

class ScanPage extends Component< Props > {
	renderProvisioning() {
		return (
			<>
				<SecurityIcon icon="in-progress" />
				{ this.renderHeader( translate( 'Preparing to scan' ) ) }
				<p>
					Lorem ipsum. We need to change this text. The scan was unable to process the themes
					directory and did not completed successfully. In order to complete the scan you will need
					to speak to support who can help determine what went wrong.
				</p>
				{ this.renderContactSupportButton() }
			</>
		);
	}

	renderHeader( text ) {
		return <h1 className="scan__header">{ text }</h1>;
	}

	renderContactSupportButton() {
		const { dispatchRecordTracksEvent, siteUrl, siteID, scanState } = this.props;
		const scanStateType = scanState?.state;

		return (
			<Button
				primary
				target="_blank"
				rel="noopener noreferrer"
				href={ contactSupportUrl( siteUrl, scanStateType ) }
				className="scan__button"
				onClick={ () =>
					dispatchRecordTracksEvent( 'calypso_scan_error_contact_support', {
						scan_state: scanStateType,
						site_id: siteID,
					} )
				}
			>
				{ translate( 'Contact Support {{externalIcon/}}', {
					components: { externalIcon: <Gridicon icon="external" size={ 24 } /> },
				} ) }
			</Button>
		);
	}
	// @todo: missing copy and design for this state
	renderUnavailable() {
		return (
			<>
				<SecurityIcon icon="scan-error" />
				{ this.renderHeader( 'Scan is unavailable' ) }
				<p>
					{ translate(
						'The scan was unable to process the themes directory and did not completed ' +
							'successfully. In order to complete the scan you will need to speak to support ' +
							'who can help determine what went wrong.'
					) }
				</p>
				{ this.renderContactSupportButton() }
			</>
		);
	}

	renderScanOkay() {
		const { siteID, siteSlug, moment, lastScanTimestamp, dispatchRecordTracksEvent } = this.props;

		return (
			<>
				<SecurityIcon />
				{ this.renderHeader( translate( 'Don’t worry about a thing' ) ) }
				<p>
					{ translate(
						/* translators: %s is a time string relative to now */
						'The last Jetpack scan ran {{strong}}%s{{/strong}} and everything ' +
							'looked great.' +
							'{{br/}}' +
							'Run a manual scan now or wait for Jetpack to scan your site later today.',
						{
							args: [ moment( lastScanTimestamp ).fromNow() ],
							components: {
								strong: <strong />,
								br: <br />,
							},
						}
					) }
				</p>
				{ isEnabled( 'jetpack-cloud/on-demand-scan' ) && (
					<Button
						primary
						href={ `/scan/${ siteSlug }` }
						className="scan__button"
						onClick={ () =>
							dispatchRecordTracksEvent( 'calypso_scan_run', {
								site_id: siteID,
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
		const { scanProgress = 0, isInitialScan } = this.props;

		const heading =
			scanProgress === 0 ? translate( 'Preparing to scan' ) : translate( 'Scanning files' );

		return (
			<>
				<SecurityIcon icon="in-progress" />
				{ this.renderHeader( heading ) }
				<ProgressBar value={ scanProgress } total={ 100 } color="#069E08" />
				{ isInitialScan && (
					<p>
						{ translate(
							'Welcome to Jetpack Scan, we are taking a first look at your site now ' +
								'and the results will be with you soon.'
						) }
					</p>
				) }
				<p>
					{ translate(
						'We will send you an email once the scan completes, in the meantime feel ' +
							'free to continue to use your site as normal, you can check back on ' +
							'progress at any time.'
					) }
				</p>
			</>
		);
	}

	renderScanError() {
		return (
			<>
				<SecurityIcon icon="scan-error" />
				{ this.renderHeader( translate( 'Something went wrong' ) ) }
				<p>
					{ translate(
						'The scan was unable to process the themes directory and did not complete ' +
							'successfully. In order to complete the scan you will need ' +
							'to speak to support who can help determine what went wrong.'
					) }
				</p>
				{ this.renderContactSupportButton() }
			</>
		);
	}

	renderScanState() {
		const { site, scanState } = this.props;
		if ( ! scanState ) {
			return <ScanPlaceholder />;
		}

		const { state, mostRecent, threats } = scanState;

		if ( state === 'provisioning' ) {
			return this.renderProvisioning();
		}

		// @todo: missing copy and design for these states
		if ( state === 'unavailable' ) {
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
				<QueryJetpackScan siteId={ this.props.siteID } />
				<PageViewTracker path="/scan/:site" title="Scanner" />
				<div className="scan__content">{ this.renderScanState() }</div>
				<StatsFooter
					header="Scan Summary"
					noticeText={ translate(
						'Failing to plan is planning to fail. Regular backups ensure that should ' +
							'the worst happen, you are prepared. Jetpack Backup has you covered.'
					) }
					noticeLink="https://jetpack.com/upgrade/backup"
				/>
			</Main>
		);
	}
}

export default connect(
	( state ) => {
		const site = getSelectedSite( state );
		const siteID = getSelectedSiteId( state );
		const siteUrl = getSiteUrl( state, siteID );
		const siteSlug = getSelectedSiteSlug( state );
		const scanState = getSiteScanState( state, siteID );
		const lastScanTimestamp = Date.now() - 5700000; // 1h 35m.
		const nextScanTimestamp = Date.now() + 5700000;
		const scanProgress = getSiteScanProgress( state, siteID );
		const isInitialScan = getSiteScanIsInitial( state, siteID );

		return {
			site,
			siteID,
			siteUrl,
			siteSlug,
			scanState,
			scanProgress,
			isInitialScan,
			lastScanTimestamp,
			nextScanTimestamp,
		};
	},
	{ dispatchRecordTracksEvent: recordTracksEvent }
)( withLocalizedMoment( ScanPage ) );
