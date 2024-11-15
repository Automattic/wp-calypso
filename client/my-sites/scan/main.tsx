import { isEnabled } from '@automattic/calypso-config';
import { Button, ProgressBar, Gridicon, Card } from '@automattic/components';
import clsx from 'clsx';
import { translate } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import JetpackReviewPrompt from 'calypso/blocks/jetpack-review-prompt';
import TimeMismatchWarning from 'calypso/blocks/time-mismatch-warning';
import DocumentHead from 'calypso/components/data/document-head';
import QueryJetpackScan from 'calypso/components/data/query-jetpack-scan';
import ScanPlaceholder from 'calypso/components/jetpack/scan-placeholder';
import ScanThreats from 'calypso/components/jetpack/scan-threats';
import SecurityIcon from 'calypso/components/jetpack/security-icon';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import SidebarNavigation from 'calypso/components/sidebar-navigation';
import { withApplySiteOffset, applySiteOffsetType } from 'calypso/components/site-offset';
import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import contactSupportUrl from 'calypso/lib/jetpack/contact-support-url';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { triggerScanRun } from 'calypso/lib/jetpack/trigger-scan-run';
import { Scan, Site } from 'calypso/my-sites/scan/types';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { setValidFrom } from 'calypso/state/jetpack-review-prompt/actions';
import { incrementCounter } from 'calypso/state/persistent-counter/actions';
import { getCount } from 'calypso/state/persistent-counter/selectors';
import getSettingsUrl from 'calypso/state/selectors/get-settings-url';
import getSiteScanIsInitial from 'calypso/state/selectors/get-site-scan-is-initial';
import getSiteScanProgress from 'calypso/state/selectors/get-site-scan-progress';
import getSiteScanRequestStatus from 'calypso/state/selectors/get-site-scan-request-status';
import getSiteScanState from 'calypso/state/selectors/get-site-scan-state';
import isRequestingJetpackScan from 'calypso/state/selectors/is-requesting-jetpack-scan';
import getSiteUrl from 'calypso/state/sites/selectors/get-site-url';
import { IAppState } from 'calypso/state/types';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import ScanNavigation from './navigation';
import type { TranslateResult } from 'i18n-calypso';
import type { utc } from 'moment';

import './style.scss';

interface Props {
	site: Site | null;
	siteId: number | null;
	siteSlug: string | null;
	siteUrl?: string;
	scanState?: Scan;
	scanProgress?: number;
	isInitialScan?: boolean;
	isRequestingScan?: boolean;
	scanPageVisitCount?: number;
	scanRequestStatus?: 'pending' | 'success' | 'failed';
	timezone: string | null;
	gmtOffset: number | null;
	moment: {
		utc: typeof utc;
	};
	applySiteOffset: applySiteOffsetType | null;
	dispatchRecordTracksEvent: typeof recordTracksEvent;
	dispatchScanRun: ( arg0: number ) => void;
	dispatchIncrementCounter: ( arg0: string, arg1: boolean, arg2: boolean ) => void;
	dispatchSetReviewPromptValid: ( arg0: 'restore' | 'scan', arg1: number | null ) => void;

	isAdmin: boolean;
	siteSettingsUrl?: string | null;
}

const SCAN_VISIT_COUNTER_NAME = 'scan-page-visit';

class ScanPage extends Component< Props > {
	componentDidMount() {
		const { scanState, dispatchIncrementCounter } = this.props;
		if ( scanState?.state && scanState?.state !== 'unavailable' ) {
			// Counting visits to the scan page for the Jetpack (Scan) Review Prompt.
			// Review Prompt should appear after 3 visits (not including same day visits)
			dispatchIncrementCounter( SCAN_VISIT_COUNTER_NAME, false, false );
		}
	}

	componentDidUpdate( prevProps: Props ) {
		if ( prevProps.scanPageVisitCount !== this.props.scanPageVisitCount ) {
			// After 3 Scan page visits, trigger the Jetpack Review Prompt.
			if ( this.props.scanPageVisitCount === 3 ) {
				this.props.dispatchSetReviewPromptValid( 'scan', Date.now() );
			}
		}
	}

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

	renderHeader( text: TranslateResult ) {
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
				<Button
					primary
					className="scan__button"
					onClick={ () => siteId && dispatchScanRun( siteId ) }
				>
					{ translate( 'Scan now' ) }
				</Button>
			</>
		);
	}

	renderScanning() {
		const { scanProgress = 0, isInitialScan } = this.props;

		const heading =
			scanProgress === 0 ? translate( 'Preparing to scan' ) : translate( 'Scanning files' );

		return (
			<>
				<Card>
					<SecurityIcon icon="in-progress" />
					{ this.renderHeader( heading ) }
					{ isInitialScan && (
						<p className="scan__initial-scan-message">
							{ translate(
								'Welcome to Jetpack Scan. We are starting your first scan now. ' +
									'Scan results will be ready soon.'
							) }
						</p>
					) }
					<p className="scan__progress-bar-percent">{ scanProgress }%</p>
					<ProgressBar value={ scanProgress } total={ 100 } color="#069E08" />
					<p>
						{ translate(
							'{{strong}}Did you know{{/strong}} {{br/}}' +
								'We will send you an email if security threats are found. In the meantime feel ' +
								'free to continue to use your site as normal, you can check back on ' +
								'progress at any time.',
							{
								components: {
									strong: <strong />,
									br: <br />,
								},
							}
						) }
					</p>
				</Card>
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
				<Button
					className="scan__button scan__retry-bottom"
					onClick={ () => siteId && dispatchScanRun( siteId ) }
				>
					{ translate( 'Retry scan' ) }
				</Button>
			</>
		);
	}

	renderScanState() {
		const { site, scanState, isRequestingScan, scanRequestStatus } = this.props;

		// Show the loading placeholder until we have a site to work with.
		if ( ! site ) {
			return <ScanPlaceholder />;
		}

		// Show scanning states first - provisioning or in-progress scans take priority.
		if ( scanState?.state === 'provisioning' ) {
			return (
				<>
					{ ' ' }
					<Card> { this.renderProvisioning() } </Card>{ ' ' }
				</>
			);
		}
		if ( scanState?.state === 'scanning' ) {
			return this.renderScanning();
		}

		// Show the loading placeholder if we're requesting an update, and have no data to show yet.
		if ( ! scanState && isRequestingScan ) {
			return <ScanPlaceholder />;
		}

		// We should have a scanState by now, since we're not requesting an update;
		// if we don't, that's an error condition and we should display that
		if ( ! scanState || scanRequestStatus === 'failed' ) {
			return (
				<>
					{ ' ' }
					<Card> { this.renderScanError() } </Card>{ ' ' }
				</>
			);
		}

		const { threats, mostRecent } = scanState;

		const threatsFound = threats.length > 0;
		const errorFound = !! mostRecent?.error;

		// If we found threats, show them whether or not Scan encountered an error
		if ( threatsFound ) {
			return <ScanThreats threats={ threats } error={ errorFound } site={ site } />;
		}

		if ( errorFound ) {
			return (
				<>
					{ ' ' }
					<Card> { this.renderScanError() } </Card>{ ' ' }
				</>
			);
		}

		return (
			<>
				{ ' ' }
				<Card> { this.renderScanOkay() } </Card>{ ' ' }
			</>
		);
	}

	renderJetpackReviewPrompt() {
		const { scanState, isRequestingScan } = this.props;
		if ( ! scanState ) {
			return;
		}
		const { threats, mostRecent } = scanState;

		const threatsFound = threats?.length;
		const errorFound = !! mostRecent?.error;

		// Only render JetpackReviewPrompt after this.renderScanOkay() is called.
		if ( isRequestingScan || threatsFound || errorFound || scanState?.state !== 'idle' ) {
			return;
		}
		return <JetpackReviewPrompt type="scan" align="left" />;
	}

	render() {
		const { siteId, siteSettingsUrl } = this.props;
		const isJetpackPlatform = isJetpackCloud();
		let mainClass = 'scan';

		if ( ! siteId ) {
			return;
		}

		if ( isEnabled( 'jetpack/more-informative-scan' ) ) {
			mainClass = 'scan-new';
		}

		return (
			<Main
				className={ clsx( mainClass, {
					is_jetpackcom: isJetpackPlatform,
				} ) }
			>
				<DocumentHead title="Scan" />
				{ isJetpackPlatform && <SidebarNavigation /> }
				<PageViewTracker path="/scan/:site" title="Scanner" />
				<TimeMismatchWarning siteId={ siteId } settingsUrl={ siteSettingsUrl } />
				{ ! ( isJetpackPlatform || isA8CForAgencies() ) && (
					<NavigationHeader navigationItems={ [] } title={ translate( 'Jetpack Scan' ) } />
				) }

				<QueryJetpackScan siteId={ siteId } />
				<ScanNavigation section="scanner" />
				<div className="scan__content">{ this.renderScanState() }</div>
				{ this.renderJetpackReviewPrompt() }
			</Main>
		);
	}
}

export default connect(
	( state: IAppState ) => {
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
		const isRequestingScan = !! isRequestingJetpackScan( state, siteId );
		const isInitialScan = getSiteScanIsInitial( state, siteId );
		const scanPageVisitCount = getCount( state, SCAN_VISIT_COUNTER_NAME, false );
		const scanRequestStatus = getSiteScanRequestStatus( state, siteId );

		return {
			site,
			siteId,
			siteUrl,
			scanState,
			scanProgress,
			isInitialScan,
			siteSettingsUrl,
			isRequestingScan,
			scanPageVisitCount,
			scanRequestStatus,
		};
	},
	{
		dispatchRecordTracksEvent: recordTracksEvent,
		dispatchScanRun: triggerScanRun,
		dispatchIncrementCounter: incrementCounter,
		dispatchSetReviewPromptValid: setValidFrom,
	}
)( withLocalizedMoment( withApplySiteOffset( ScanPage ) ) );
