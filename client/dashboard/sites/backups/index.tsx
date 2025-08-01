import { useQuery } from '@tanstack/react-query';
import { __experimentalText as Text } from '@wordpress/components';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { dateI18n } from '@wordpress/date';
import { __ } from '@wordpress/i18n';
import { chartBar } from '@wordpress/icons';
import { useState } from 'react';
import { siteBySlugQuery } from '../../app/queries/site';
import { siteLastFiveActivityLogEntriesQuery } from '../../app/queries/site-activity-log';
import { siteRoute } from '../../app/router';
import { Callout } from '../../components/callout';
import { CalloutOverlay } from '../../components/callout-overlay';
import DataViewsCard from '../../components/dataviews-card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import UpsellCTAButton from '../../components/upsell-cta-button';
import { HostingFeatures } from '../../data/constants';
import { hasHostingFeature } from '../../utils/site-features';
import { DEFAULT_PER_PAGE_SIZES } from '../views';
import illustrationUrl from './backups-callout-illustration.svg';
import type { ActivityLogEntry, Site } from '../../data/types';
import type { Field, View } from '@wordpress/dataviews';

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

const fields: Field< ActivityLogEntry >[] = [
	{
		id: 'date',
		label: __( 'Date' ),
		render: ( { item } ) => (
			<>
				<strong>{ dateI18n( 'F j, Y', item.published ) }</strong>
				&nbsp;
				{ dateI18n( 'g:i A', item.published ) }
			</>
		),
	},
	{
		id: 'action',
		label: __( 'Action' ),
		getValue: ( { item } ) => `${ item.summary }: ${ item.content.text }`,
		render: ( { item } ) => (
			<>
				<strong>{ item.summary }</strong>: { item.content.text }
			</>
		),
		enableGlobalSearch: true,
	},
	{
		id: 'user',
		label: __( 'User' ),
		getValue: ( { item } ) => item.actor.name,
	},
];

function Backups( { site }: { site: Site } ) {
	const [ view, setView ] = useState< View >( {
		type: 'table',
		fields: [ 'date', 'action', 'user' ],
	} );

	const { data: activityLog, isLoading: isLoadingActivityLog } = useQuery(
		siteLastFiveActivityLogEntriesQuery( site.ID )
	);

	const rawData = activityLog || [];
	const { data: filteredData, paginationInfo } = filterSortAndPaginate( rawData, view, fields );

	return (
		<DataViewsCard>
			<DataViews< ActivityLogEntry >
				getItemId={ ( item ) => item.activity_id }
				data={ filteredData }
				fields={ fields }
				view={ view }
				onChangeView={ setView }
				isLoading={ isLoadingActivityLog }
				defaultLayouts={ { table: {} } }
				paginationInfo={ paginationInfo }
				perPageSizes={ DEFAULT_PER_PAGE_SIZES }
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

	return (
		<PageLayout header={ <PageHeader title={ __( 'Backups' ) } /> }>
			<CalloutOverlay
				showCallout={ ! hasHostingFeature( site, HostingFeatures.BACKUPS ) }
				callout={ <SiteBackupsCallout siteSlug={ site.slug } /> }
				main={ <Backups site={ site } /> }
			/>
		</PageLayout>
	);
}

export default SiteBackups;
