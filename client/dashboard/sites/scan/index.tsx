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
import HostingFeatureGatedWithCallout from '../hosting-feature-gated-with-callout';
import { ActiveThreatsDataViews } from '../scan-active';
import illustrationUrl from './scan-callout-illustration.svg';
import './style.scss';

const SCAN_TABS = [
	{ name: 'active', title: __( 'Active threats' ) },
	{ name: 'history', title: __( 'History' ) },
];

function SiteScan( { scanTab }: { scanTab: 'active' | 'history' } ) {
	const { siteSlug } = siteRoute.useParams();
	const router = useRouter();

	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );

	const handleTabChange = ( tab: 'active' | 'history' ) => {
		if ( tab === 'active' ) {
			router.navigate( { to: `/sites/${ siteSlug }/scan/active` } );
		} else {
			router.navigate( { to: `/sites/${ siteSlug }/scan/history` } );
		}
	};

	return (
		<PageLayout
			header={
				// @TODO: Add translation and relative time
				<PageHeader
					title={ __( 'Scan' ) }
					description="Latest automated scan run X hours ago"
					actions={
						<ButtonStack>
							<Button variant="secondary">{ __( 'Scan now' ) }</Button>
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
						{ scanTab === 'active' && <ActiveThreatsDataViews site={ site } /> }
						{ scanTab === 'history' && (
							<Text as="p" variant="muted">
								{ __( 'So far, there are no archived threats on your site.' ) }
							</Text>
						) }
					</CardBody>
				</Card>
			</HostingFeatureGatedWithCallout>
		</PageLayout>
	);
}

export default SiteScan;
