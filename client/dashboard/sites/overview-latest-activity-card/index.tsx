import { siteLastFiveActivityLogEntriesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardBody, Icon } from '@wordpress/components';
import { DataViews } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useAnalytics } from '../../app/analytics';
import { SectionHeader } from '../../components/section-header';
import { SummaryButtonCardFooter } from '../../components/summary-button-card-footer';
import { TextSkeleton } from '../../components/text-skeleton';
import TimeSince from '../../components/time-since';
import { gridiconToWordPressIcon } from '../../utils/gridicons';
import { isDashboardBackport } from '../../utils/is-dashboard-backport';
import { isSelfHostedJetpackConnected } from '../../utils/site-types';
import type { ActivityLogEntry, Site } from '@automattic/api-core';
import type { Field } from '@wordpress/dataviews';
import './style.scss';

const fields: Field< ActivityLogEntry >[] = [
	{
		id: 'gridicon',
		render: ( { item } ) => (
			<Icon
				icon={ gridiconToWordPressIcon( item.gridicon ) }
				size={ 32 }
				className="dashboard-overview-latest-activity-card__icon"
			/>
		),
	},
	{
		id: 'content_text',
		getValue: ( { item } ) => item.content.text,
	},
	{
		id: 'summary',
		getValue: ( { item } ) => item.summary,
	},
	{
		id: 'published',
		getValue: ( { item } ) => item.published,
		render: ( { item } ) => <TimeSince timestamp={ item.published } />,
	},
	{
		id: 'actor_name',
		getValue: ( { item } ) => item.actor.name,
	},
];

function getActivityLogUrl( site: Site ) {
	if ( isSelfHostedJetpackConnected( site ) ) {
		return `https://cloud.jetpack.com/activity-log/${ site.slug }`;
	}

	return isDashboardBackport()
		? `/activity-log/${ site.slug }`
		: `/sites/${ site.slug }/logs/activity`;
}

export default function LatestActivityCard( {
	site,
	isCompact = false,
}: {
	site: Site;
	isCompact?: boolean;
} ) {
	const { data } = useQuery( siteLastFiveActivityLogEntriesQuery( site.ID ) );
	const { recordTracksEvent } = useAnalytics();

	const view = {
		fields: [ 'summary', 'published', 'actor_name' ],
		type: 'list' as const,
		titleField: 'content_text',
		mediaField: 'gridicon',
		showMedia: ! isCompact,
	};

	const handleClickSeeAll = () => {
		recordTracksEvent( 'calypso_dashboard_site_overview_see_all_activity_click' );
	};

	return (
		<Card className="dashboard-overview-latest-activity-card">
			<CardHeader>
				<SectionHeader title={ __( 'Latest activity' ) } level={ 3 } />
			</CardHeader>
			<CardBody>
				{ data === undefined ? (
					<TextSkeleton length={ 30 } />
				) : (
					<DataViews< ActivityLogEntry >
						data={ data }
						fields={ fields }
						view={ view }
						onChangeView={ () => {} }
						getItemId={ ( item ) => item.activity_id }
						paginationInfo={ { totalItems: data.length, totalPages: 1 } }
						defaultLayouts={ { list: {} } }
						empty={ <p>{ __( 'No activity yet.' ) }</p> }
					>
						<DataViews.Layout />
					</DataViews>
				) }
			</CardBody>
			{ data && data.length > 0 && (
				<SummaryButtonCardFooter
					title={ __( 'See all activity' ) }
					href={ getActivityLogUrl( site ) }
					density="medium"
					onClick={ handleClickSeeAll }
				/>
			) }
		</Card>
	);
}
