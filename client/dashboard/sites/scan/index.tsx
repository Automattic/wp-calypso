import { HostingFeatures } from '@automattic/api-core';
import { siteBySlugQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import {
	Button,
	TabPanel,
	Card,
	CardHeader,
	CardBody,
	__experimentalText as Text,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { shield } from '@wordpress/icons';
import { siteRoute } from '../../app/router/sites';
import { ButtonStack } from '../../components/button-stack';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { useTimeSince } from '../../components/time-since';
import HostingFeatureGatedWithCallout from '../hosting-feature-gated-with-callout';
import { ActiveThreatsDataViews } from '../scan-active';
import { ScanHistoryDataViews } from '../scan-history';
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

	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );

	const scanState = useScanState( site.ID );
	const { scan, status } = scanState;

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
		const showStatus = status === 'enqueued' || status === 'running';
		if ( showStatus ) {
			return <ScanStatus scanState={ scanState } />;
		}
		return <ActiveThreatsDataViews site={ site } />;
	};

	return (
		<PageLayout
			header={
				<PageHeader
					title={ __( 'Scan' ) }
					description={ getPageDescription() }
					actions={
						<ButtonStack>
							<ScanNowButton site={ site } scanState={ scanState } />
							{ /* @TODO: Hide this button if there are no fixable threats */ }
							<Button variant="primary">
								{ sprintf(
									/* translators: %d: number of threats */
									__( 'Auto-fix %(threatsCount)d threats' ),
									{
										// @TODO: replace with the actual number of active fixable threats
										threatsCount: 4,
									}
								) }
							</Button>
						</ButtonStack>
					}
				/>
			}
			notices={ <ScanNotices status={ status } threatCount={ threatCount } /> }
		>
			<HostingFeatureGatedWithCallout
				site={ site }
				feature={ HostingFeatures.SCAN }
				tracksFeatureId="scan"
				asOverlay
				upsellIcon={ shield }
				upsellTitle={ __( 'Scan for security threats' ) }
				upsellImage={ illustrationUrl }
				upsellDescription={
					<Text as="p" variant="muted">
						Automated daily scans check for malware and security vulnerabilities, with automated
						fixes for most issues.
					</Text>
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
						{ scanTab === 'history' && <ScanHistoryDataViews site={ site } /> }
					</CardBody>
				</Card>
			</HostingFeatureGatedWithCallout>
		</PageLayout>
	);
}

export default SiteScan;
