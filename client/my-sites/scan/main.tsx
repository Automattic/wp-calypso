/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Card, ProgressBar } from '@automattic/components';
import { translate } from 'i18n-calypso';
import { flowRight as compose } from 'lodash';
import { isEnabled } from 'calypso/config';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import DocumentHead from 'calypso/components/data/document-head';
import QueryJetpackScan from 'calypso/components/data/query-jetpack-scan';
import FormattedHeader from 'calypso/components/formatted-header';
import SecurityIcon from 'calypso/components/jetpack/security-icon';
import ScanPlaceholder from 'calypso/components/jetpack/scan-placeholder';
import ScanThreats from 'calypso/components/jetpack/scan-threats';
import { Scan, Site } from 'calypso/my-sites/scan/types';
import EmptyContent from 'calypso/components/empty-content';
import Gridicon from 'calypso/components/gridicon';
import Main from 'calypso/components/main';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import canCurrentUser from 'calypso/state/selectors/can-current-user';
import getSiteUrl from 'calypso/state/sites/selectors/get-site-url';
import getSiteScanProgress from 'calypso/state/selectors/get-site-scan-progress';
import getSiteScanIsInitial from 'calypso/state/selectors/get-site-scan-is-initial';
import getSiteScanState from 'calypso/state/selectors/get-site-scan-state';
import getSettingsUrl from 'calypso/state/selectors/get-settings-url';
import isRequestingJetpackScan from 'calypso/state/selectors/is-requesting-jetpack-scan';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import contactSupportUrl from 'calypso/lib/jetpack/contact-support-url';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { triggerScanRun } from 'calypso/lib/jetpack/trigger-scan-run';
import { withApplySiteOffset, applySiteOffsetType } from 'calypso/components/site-offset';
import ScanNavigation from './navigation';
import TimeMismatchWarning from 'calypso/blocks/time-mismatch-warning';

/**
 * Type dependencies
 */
import type { utc } from 'moment';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	site: Site | null;
	siteId: number | null;
	siteSlug: string | null;
	siteUrl?: string;
	scanState?: Scan;
	scanProgress?: number;
	isInitialScan?: boolean;
	isRequestingScan: boolean;
	timezone: string | null;
	gmtOffset: number | null;
	moment: {
		utc: typeof utc;
	};
	applySiteOffset: applySiteOffsetType;
	dispatchRecordTracksEvent: ( arg0: string, arg1: Record< string, unknown > ) => null;
	dispatchScanRun: ( arg0: number ) => null;
	isAdmin: boolean;
	siteSettingsUrl: string;
}

class ScanPage extends Component< Props > {
	renderProvisioning() {
		return (
			<>
				<SecurityIcon />
				{ this.renderHeader( translate( 'Preparing to scan' ) ) }
				<p>
					{ translate(
						"Welcome to Jetpack Scan! We're scoping out your site, setting up to do a full scan. " +
							"We'll let you know if we spot any issues that might impact a scan, " +
							'then your first full scan will start.'
					) }
				</p>
			</>
		);
	}

	renderHeader( text: i18nCalypso.TranslateResult ) {
		return <h1 className="scan__header">{ text }</h1>;
	}

	renderContactSupportButton() {
		const { dispatchRecordTracksEvent, siteUrl, siteId, scanState } = this.props;
		const scanStateType = scanState?.state;

		return (
			<Button
				primary
				target="_blank"
				rel="noopener noreferrer"
				href={ contactSupportUrl( siteUrl, scanStateType ) }
				className="scan__button"
				onClick={ () =>
					dispatchRecordTracksEvent( 'calypso_jetpack_scan_error_contact', {
						scan_state: scanStateType,
						site_id: siteId,
					} )
				}
			>
				{ translate( 'Contact support {{externalIcon/}}', {
					components: { externalIcon: <Gridicon icon="external" size={ 24 } /> },
				} ) }
			</Button>
		);
	}

	renderScanOkay() {
		const { scanState, siteId, moment, dispatchScanRun, applySiteOffset } = this.props;

		const lastScanStartTime = scanState?.mostRecent?.timestamp;
		const lastScanDuration = scanState?.mostRecent?.duration;

		let lastScanFinishTime = '';
		if ( lastScanStartTime && applySiteOffset ) {
			lastScanFinishTime = applySiteOffset(
				moment.utc( lastScanStartTime ).add( lastScanDuration, 'seconds' )
			).fromNow();
		}

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
							args: [ lastScanFinishTime ],
							components: {
								strong: <strong />,
								br: <br />,
							},
						}
					) }
				</p>
				{ isEnabled( 'jetpack/on-demand-scan' ) && (
					<Button
						primary
						className="scan__button"
						onClick={ () => siteId && dispatchScanRun( siteId ) }
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
		const { siteId, dispatchScanRun } = this.props;

		return (
			<>
				<SecurityIcon icon="scan-error" />
				{ this.renderHeader( translate( 'Something went wrong' ) ) }
				<p>
					{ translate(
						"Jetpack Scan couldn't complete a scan of your site. Please check to see if your site is down " +
							"– if it's not, try again. If it is, or if Jetpack Scan is still having problems, contact our support team."
					) }
				</p>
				{ this.renderContactSupportButton() }
				{ isEnabled( 'jetpack/on-demand-scan' ) && (
					<Button
						className="scan__button scan__retry-bottom"
						onClick={ () => siteId && dispatchScanRun( siteId ) }
					>
						{ translate( 'Retry scan' ) }
					</Button>
				) }
			</>
		);
	}

	renderScanState() {
		const { site, scanState, isRequestingScan } = this.props;

		// We don't know yet which site we're looking at,
		// so show a placeholder until data comes in
		if ( ! site ) {
			return <ScanPlaceholder />;
		}

		// If we're scanning or preparing to scan, show those statuses;
		// importantly, *don't* show the loading placeholder,
		// because it disrupts the fluidity of the progress bar

		if ( scanState?.state === 'provisioning' ) {
			return this.renderProvisioning();
		}

		if ( scanState?.state === 'scanning' ) {
			return this.renderScanning();
		}

		// *Now* we can show the loading placeholder,
		// if in fact we're requesting a Scan status update
		if ( isRequestingScan ) {
			return <ScanPlaceholder />;
		}

		// We should have a scanState by now, since we're not requesting an update;
		// if we don't, that's an error condition and we should display that
		if ( ! scanState ) {
			return this.renderScanError();
		}

		const { threats, mostRecent } = scanState;

		const threatsFound = threats.length > 0;
		const errorFound = !! mostRecent?.error;

		// If we found threats, show them whether or not Scan encountered an error
		if ( threatsFound ) {
			return <ScanThreats threats={ threats } error={ errorFound } site={ site } />;
		}

		if ( errorFound ) {
			return this.renderScanError();
		}

		return this.renderScanOkay();
	}

	render() {
		const { isAdmin, siteId, siteSettingsUrl } = this.props;
		const isJetpackPlatform = isJetpackCloud();

		if ( ! siteId ) {
			return;
		}

		return (
			<Main
				className={ classNames( 'scan', {
					is_jetpackcom: isJetpackPlatform,
				} ) }
			>
				<DocumentHead title="Scan" />
				<SidebarNavigation />
				<PageViewTracker path="/scan/:site" title="Scanner" />
				<TimeMismatchWarning siteId={ siteId } settingsUrl={ siteSettingsUrl } />
				{ ! isJetpackPlatform && (
					<FormattedHeader headerText={ 'Jetpack Scan' } align="left" brandFont />
				) }
				{ isAdmin && (
					<>
						<QueryJetpackScan siteId={ siteId } />
						<ScanNavigation section={ 'scanner' } />
						<Card>
							<div className="scan__content">{ this.renderScanState() }</div>
						</Card>
					</>
				) }
				{ ! isAdmin && (
					<EmptyContent
						illustration="/calypso/images/illustrations/illustration-404.svg"
						title={ translate( 'You are not authorized to view this page' ) }
					/>
				) }
			</Main>
		);
	}
}

export default connect(
	( state ) => {
		const site = getSelectedSite( state ) as Site;
		const siteId = getSelectedSiteId( state );
		if ( ! siteId ) {
			return {
				site,
				siteId,
			};
		}
		const siteUrl = getSiteUrl( state, siteId ) ?? undefined;
		const siteSettingsUrl = getSettingsUrl( state, siteId, 'general' );
		const scanState = ( getSiteScanState( state, siteId ) as Scan ) ?? undefined;
		const scanProgress = getSiteScanProgress( state, siteId ) ?? undefined;
		const isRequestingScan = isRequestingJetpackScan( state, siteId );
		const isInitialScan = getSiteScanIsInitial( state, siteId );
		const isAdmin = canCurrentUser( state, siteId, 'manage_options' );

		return {
			site,
			siteId,
			siteUrl,
			scanState,
			scanProgress,
			isInitialScan,
			siteSettingsUrl,
			isRequestingScan,
			isAdmin,
		};
	},
	{
		dispatchRecordTracksEvent: recordTracksEvent,
		dispatchScanRun: triggerScanRun,
	}
)( compose( withLocalizedMoment, withApplySiteOffset )( ScanPage ) );
