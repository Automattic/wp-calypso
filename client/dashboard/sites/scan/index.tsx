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
import { Callout } from '../../components/callout';
import { CalloutOverlay } from '../../components/callout-overlay';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import UpsellCTAButton from '../../components/upsell-cta-button';
import { hasHostingFeature } from '../../utils/site-features';
// @TODO: replace with Scan callout illustration
import illustrationUrl from '../backups/backups-callout-illustration.svg';

export function SiteScanCallout( {
	siteSlug,
	titleAs = 'h1',
}: {
	siteSlug: string;
	titleAs?: React.ElementType | keyof JSX.IntrinsicElements;
} ) {
	return (
		<Callout
			icon={ shield }
			title={ __( 'Scan for security threats' ) }
			titleAs={ titleAs }
			image={ illustrationUrl }
			description={
				<>
					<Text as="p" variant="muted">
						{ /* @TODO: update copy when the design is ready and add translation */ }
						Automated daily scans check for malware and security vulnerabilities, with automated
						fixes for many issues.
					</Text>
					<Text as="p" variant="muted">
						{ __( 'Available on the WordPress.com Business and Commerce plans.' ) }
					</Text>
				</>
			}
			actions={
				<UpsellCTAButton
					text={ __( 'Upgrade plan' ) }
					tracksId="scan"
					variant="primary"
					href={ `/checkout/${ siteSlug }/business` }
				/>
			}
		/>
	);
}

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
			<CalloutOverlay
				showCallout={ ! hasHostingFeature( site, HostingFeatures.SCAN ) }
				callout={ <SiteScanCallout siteSlug={ site.slug } /> }
				main={
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
							{ scanTab === 'active' ? (
								<Text as="p" variant="muted">
									{ __( 'No active threats found. Your site is secure.' ) }
								</Text>
							) : (
								<Text as="p" variant="muted">
									{ __( 'So far, there are no archived threats on your site.' ) }
								</Text>
							) }
						</CardBody>
					</Card>
				}
			/>
		</PageLayout>
	);
}

export default SiteScan;
