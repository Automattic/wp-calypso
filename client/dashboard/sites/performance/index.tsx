import { Card, CardBody, __experimentalText as Text } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { chartBar } from '@wordpress/icons';
import { Callout } from '../../components/callout';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import UpsellCTAButton from '../../components/upsell-cta-button';
import illustrationUrl from './performance-callout-illustration.svg';

export function SitePerformanceCallout( {
	siteSlug,
	titleAs = 'h1',
}: {
	siteSlug: string;
	titleAs?: React.ElementType | keyof JSX.IntrinsicElements;
} ) {
	return (
		<Callout
			icon={ chartBar }
			title={ __( 'Optimize your site’s performance' ) }
			titleAs={ titleAs }
			image={ illustrationUrl }
			description={
				<>
					<Text as="p" variant="muted">
						{ __(
							'Make smarter decisions, boost speed and engagement, and see how your site‘s performing with key metrics and contextual insights.'
						) }
					</Text>
					<Text as="p" variant="muted">
						{ __( 'Available on the WordPress.com Business and Commerce plans.' ) }
					</Text>
				</>
			}
			actions={
				<UpsellCTAButton
					text={ __( 'Upgrade plan' ) }
					tracksId="performance"
					variant="primary"
					href={ `/checkout/${ siteSlug }/business` }
				/>
			}
		/>
	);
}

function SitePerformance() {
	return (
		<PageLayout header={ <PageHeader title={ __( 'Performance' ) } /> }>
			<Card>
				<CardBody>
					<></>
				</CardBody>
			</Card>
		</PageLayout>
	);
}

export default SitePerformance;
