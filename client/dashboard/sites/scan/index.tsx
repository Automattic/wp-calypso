import { HostingFeatures } from '@automattic/api-core';
import { siteBySlugQuery, siteSettingsQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { Button, Modal, TabPanel } from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import { shield } from '@wordpress/icons';
import { useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { siteRoute } from '../../app/router/sites';
import { ButtonStack } from '../../components/button-stack';
import { Card, CardHeader, CardBody } from '../../components/card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import TimeMismatchNotice from '../../components/time-mismatch-notice';
import { useTimeSince } from '../../components/time-since';
import HostingFeatureGatedWithCallout from '../hosting-feature-gated-with-callout';
import { ActiveThreatsDataViews } from '../scan-active';
import { ScanHistoryDataViews } from '../scan-history';
import { BulkFixThreatsModal } from './components/bulk-fix-threats-modal';
import illustrationUrl from './scan-callout-illustration.svg';
import { ScanNotices } from './scan-notices';
import { ScanNowButton } from './scan-now-button';
import { ScanStatus } from './status';
import { useScanState } from './use-scan-state';

import './style.scss';

const SCAN_TABS = [
	{ name: 'active', title: __( 'Active threats' ) },
	{ name: 'history', title: __( 'History' ) },
];

function SiteScan( { scanTab }: { scanTab: 'active' | 'history' } ) {
	const { siteSlug } = siteRoute.useParams();
	const router = useRouter();

	const { recordTracksEvent } = useAnalytics();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const [ showBulkFixModal, setShowBulkFixModal ] = useState( false );

	const settingsUrl = site.options?.admin_url
		? `${ site.options.admin_url }options-general.php`
		: '';

	const { data: siteSettings } = useSuspenseQuery( {
		...siteSettingsQuery( site.ID ),
		select: ( s ) => ( {
			gmtOffset: Number( s?.gmt_offset ) || 0,
			timezoneString: s?.timezone_string || undefined,
		} ),
	} );

	const { gmtOffset, timezoneString } = siteSettings;

	const scanState = useScanState( site.ID );
	const { scan, status } = scanState;
	const isScanInProgress = status === 'enqueued' || status === 'running';
	const fixableThreatsCount = scan?.threats?.filter( ( threat ) => threat.fixable ).length || 0;
	const lastScanTime = scan?.most_recent?.timestamp;
	const lastScanRelativeTime = useTimeSince( lastScanTime || '' );
	const threatCount = scan?.threats?.length || 0;

	const getPageDescription = () => {
		if ( lastScanTime && lastScanRelativeTime ) {
			return sprintf(
				/* translators: %s: relative time since last scan */
				__( 'Latest scan ran %s.' ),
				lastScanRelativeTime
			);
		}

		return null;
	};

	const handleTabChange = ( tab: 'active' | 'history' ) => {
		if ( tab === 'active' ) {
			router.navigate( { to: `/sites/${ siteSlug }/scan/active` } );
		} else {
			router.navigate( { to: `/sites/${ siteSlug }/scan/history` } );
		}
	};

	const renderActiveTab = () => {
		if ( isScanInProgress ) {
			return <ScanStatus scanState={ scanState } />;
		}
		return (
			<ActiveThreatsDataViews
				site={ site }
				timezoneString={ timezoneString }
				gmtOffset={ gmtOffset }
			/>
		);
	};

	return (
		<HostingFeatureGatedWithCallout
			site={ site }
			feature={ HostingFeatures.SCAN }
			upsellId="site-scan"
			overlay={ <PageLayout header={ <PageHeader title={ __( 'Scan' ) } /> } /> }
			upsellIcon={ shield }
			upsellTitle={ __( 'Scan for security threats' ) }
			upsellImage={ illustrationUrl }
			upsellDescription={ __(
				'Automated daily scans check for malware and security vulnerabilities, with automated fixes for most issues.'
			) }
		>
			<PageLayout
				header={
					<PageHeader
						title={ __( 'Scan' ) }
						description={ getPageDescription() }
						actions={
							<ButtonStack>
								<ScanNowButton site={ site } scanState={ scanState } />
								{ fixableThreatsCount > 0 && (
									<Button
										variant="primary"
										disabled={ isScanInProgress }
										onClick={ () => {
											recordTracksEvent( 'calypso_dashboard_scan_fix_threats_cta_click', {
												threat_count: fixableThreatsCount,
											} );
											setShowBulkFixModal( true );
										} }
									>
										{ sprintf(
											/* translators: %d: number of threats */
											_n(
												'Auto-fix %(threatsCount)d threat',
												'Auto-fix %(threatsCount)d threats',
												fixableThreatsCount
											),
											{
												threatsCount: fixableThreatsCount,
											}
										) }
									</Button>
								) }
							</ButtonStack>
						}
					/>
				}
				notices={
					<>
						<TimeMismatchNotice
							settingsUrl={ settingsUrl }
							siteTime={ gmtOffset }
							siteId={ site.ID }
						/>
						<ScanNotices status={ status } threatCount={ threatCount } />
					</>
				}
			>
				<Card>
					<CardHeader style={ { paddingBottom: '0' } }>
						<TabPanel
							activeClass="is-active"
							tabs={ SCAN_TABS }
							onSelect={ ( tabName ) => {
								if ( tabName === 'active' || tabName === 'history' ) {
									handleTabChange( tabName );
								}
							} }
							initialTabName={ scanTab }
						>
							{ () => null }
						</TabPanel>
					</CardHeader>
					<CardBody>
						{ scanTab === 'active' && renderActiveTab() }
						{ scanTab === 'history' && (
							<ScanHistoryDataViews
								site={ site }
								timezoneString={ timezoneString }
								gmtOffset={ gmtOffset }
							/>
						) }
					</CardBody>
				</Card>
			</PageLayout>
			{ showBulkFixModal && (
				<Modal
					title={ __( 'Auto-fix threats' ) }
					onRequestClose={ () => setShowBulkFixModal( false ) }
					size="medium"
				>
					<BulkFixThreatsModal
						items={ scan?.threats?.filter( ( threat ) => threat.fixable ) || [] }
						closeModal={ () => setShowBulkFixModal( false ) }
						site={ site }
					/>
				</Modal>
			) }
		</HostingFeatureGatedWithCallout>
	);
}

export default SiteScan;
