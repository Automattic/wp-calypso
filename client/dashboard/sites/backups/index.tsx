import { useQuery } from '@tanstack/react-query';
import { __experimentalText as Text } from '@wordpress/components';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { chartBar } from '@wordpress/icons';
import { useState } from 'react';
import { siteBySlugQuery } from '../../app/queries/site';
import { siteRewindableActivityLogEntriesQuery } from '../../app/queries/site-activity-log';
import { siteRoute } from '../../app/router';
import { Callout } from '../../components/callout';
import { CalloutOverlay } from '../../components/callout-overlay';
import DataViewsCard from '../../components/dataviews-card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import UpsellCTAButton from '../../components/upsell-cta-button';
import { HostingFeatures } from '../../data/constants';
import { hasHostingFeature } from '../../utils/site-features';
import { BackupNowButton } from './backup-now-button';
import illustrationUrl from './backups-callout-illustration.svg';
import { getActions } from './dataviews/actions';
import { getFields } from './dataviews/fields';
import type { ActivityLogEntry, Site } from '../../data/types';
import type { View } from '@wordpress/dataviews';

export function SiteBackupsCallout( {
	siteSlug,
	titleAs = 'h1',
}: {
	siteSlug: string;
	titleAs?: React.ElementType | keyof JSX.IntrinsicElements;
} ) {
	return (
		<Callout
			icon={ chartBar }
			title={ __( 'Secure your content with Jetpack Backups' ) }
			titleAs={ titleAs }
			image={ illustrationUrl }
			description={
				<>
					<Text as="p" variant="muted">
						{ __(
							'Protect your site with scheduled and real-time backups—giving you the ultimate “undo” button and peace of mind that your content is always safe.'
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
					tracksId="backups"
					variant="primary"
					href={ `/checkout/${ siteSlug }/business` }
				/>
			}
		/>
	);
}

function Backups( { site }: { site: Site } ) {
	const [ view, setView ] = useState< View >( {
		type: 'table',
		fields: [ 'date', 'action', 'user' ],
		perPage: 10,
	} );

	const { data: activityLog = [], isLoading: isLoadingActivityLog } = useQuery(
		siteRewindableActivityLogEntriesQuery( site.ID )
	);

	const fields = getFields();
	const actions = getActions( site );
	const { data: filteredData, paginationInfo } = filterSortAndPaginate( activityLog, view, fields );

	return (
		<DataViewsCard>
			<DataViews< ActivityLogEntry >
				getItemId={ ( item ) => item.activity_id }
				data={ filteredData }
				fields={ fields }
				actions={ actions }
				view={ view }
				onChangeView={ setView }
				isLoading={ isLoadingActivityLog }
				defaultLayouts={ { table: {} } }
				paginationInfo={ paginationInfo }
				searchLabel={ __( 'Search backups' ) }
			/>
		</DataViewsCard>
	);
}

function SiteBackups() {
	const { siteSlug } = siteRoute.useParams();
	const { data: site } = useQuery( siteBySlugQuery( siteSlug ) );

	if ( ! site ) {
		return;
	}

	const hasBackups = hasHostingFeature( site, HostingFeatures.BACKUPS );

	return (
		<PageLayout
			header={
				<PageHeader
					title={ __( 'Backups' ) }
					actions={ hasBackups && <BackupNowButton site={ site } /> }
				/>
			}
		>
			<CalloutOverlay
				showCallout={ ! hasBackups }
				callout={ <SiteBackupsCallout siteSlug={ site.slug } /> }
				main={ <Backups site={ site } /> }
			/>
		</PageLayout>
	);
}

export default SiteBackups;
