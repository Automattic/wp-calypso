/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Card, ProgressBar } from '@automattic/components';
import { translate } from 'i18n-calypso';
import { flowRight as compose } from 'lodash';
import { isEnabled } from 'config';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import QueryJetpackScan from 'components/data/query-jetpack-scan';
import FormattedHeader from 'components/formatted-header';
import SecurityIcon from 'components/jetpack/security-icon';
import ScanPlaceholder from 'components/jetpack/scan-placeholder';
import ScanThreats from 'components/jetpack/scan-threats';
import { Scan, Site } from 'my-sites/scan/types';
import Gridicon from 'components/gridicon';
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import getSiteUrl from 'state/sites/selectors/get-site-url';
import getSiteScanProgress from 'state/selectors/get-site-scan-progress';
import getSiteScanIsInitial from 'state/selectors/get-site-scan-is-initial';
import getSiteScanState from 'state/selectors/get-site-scan-state';
import { withLocalizedMoment } from 'components/localized-moment';
import contactSupportUrl from 'lib/jetpack/contact-support-url';
import isJetpackCloud from 'lib/jetpack/is-jetpack-cloud';
import { recordTracksEvent } from 'state/analytics/actions';
import { triggerScanRun } from 'lib/jetpack/trigger-scan-run';
import { withApplySiteOffset, applySiteOffsetType } from 'components/jetpack/site-offset';
import ScanNavigation from './navigation';

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
	timezone: string | null;
	gmtOffset: number | null;
	moment: {
		utc: Function;
	};
	applySiteOffset: applySiteOffsetType;
	dispatchRecordTracksEvent: Function;
	dispatchScanRun: Function;
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
					<Button primary className="scan__button" onClick={ () => dispatchScanRun( siteId ) }>
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
						onClick={ () => dispatchScanRun( siteId ) }
					>
						{ translate( 'Retry scan' ) }
					</Button>
				) }
			</>
		);
	}

	renderScanState() {
		const { site, scanState } = this.props;
		if ( ! scanState || ! site ) {
			return <ScanPlaceholder />;
		}

		const { state, mostRecent, threats } = scanState;

		if ( state === 'provisioning' ) {
			return this.renderProvisioning();
		}

		if ( state === 'scanning' ) {
			return this.renderScanning();
		}

		const errorFound = !! mostRecent?.error;
		const threatsFound = threats.length > 0;

		if ( errorFound && ! threatsFound ) {
			return this.renderScanError();
		}

		if ( threatsFound ) {
			return <ScanThreats threats={ threats } error={ errorFound } site={ site } />;
		}

		return this.renderScanOkay();
	}

	render() {
		const { siteId } = this.props;
		const isJetpackPlatform = isJetpackCloud();

		if ( ! siteId ) {
			return;
		}

		return (
			<Main
				className={ classNames( 'scan', {
					is_jetpackcom: isJetpackPlatform,
				} ) }
				wideLayout={ ! isJetpackPlatform }
			>
				<DocumentHead title="Scan" />
				<SidebarNavigation />
				<QueryJetpackScan siteId={ siteId } />
				<PageViewTracker path="/scan/:site" title="Scanner" />
				{ ! isJetpackPlatform && <FormattedHeader headerText={ 'Jetpack Scan' } align="left" /> }
				<ScanNavigation section={ 'scanner' } />
				<Card>
					<div className="scan__content">{ this.renderScanState() }</div>
				</Card>
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
		const scanState = ( getSiteScanState( state, siteId ) as Scan ) ?? undefined;
		const scanProgress = getSiteScanProgress( state, siteId ) ?? undefined;
		const isInitialScan = getSiteScanIsInitial( state, siteId );

		return {
			site,
			siteId,
			siteUrl,
			scanState,
			scanProgress,
			isInitialScan,
		};
	},
	{
		dispatchRecordTracksEvent: recordTracksEvent,
		dispatchScanRun: triggerScanRun,
	}
)( compose( withLocalizedMoment, withApplySiteOffset )( ScanPage ) );
