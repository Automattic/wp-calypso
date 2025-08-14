import { useQuery } from '@tanstack/react-query';
import {
	__experimentalText as Text,
	__experimentalGrid as Grid,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Card,
	CardHeader,
	Icon,
} from '@wordpress/components';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { chartBar } from '@wordpress/icons';
import { useState, useEffect } from 'react';
import { siteBySlugQuery } from '../../app/queries/site';
import { siteRewindableActivityLogEntriesQuery } from '../../app/queries/site-activity-log';
import { siteRoute } from '../../app/router';
import { Callout } from '../../components/callout';
import { CalloutOverlay } from '../../components/callout-overlay';
import DataViewsCard from '../../components/dataviews-card';
import { useFormattedTime } from '../../components/formatted-time';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { SectionHeader } from '../../components/section-header';
import UpsellCTAButton from '../../components/upsell-cta-button';
import { HostingFeatures } from '../../data/constants';
import { gridiconToWordPressIcon } from '../../utils/gridicons';
import { hasHostingFeature } from '../../utils/site-features';
import { BackupNowButton } from './backup-now-button';
import illustrationUrl from './backups-callout-illustration.svg';
import { getFields } from './dataviews/fields';
import './style.scss';
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

function Backups( {
	site,
	selectedBackup,
	setSelectBackup,
}: {
	site: Site;
	selectedBackup: ActivityLogEntry | null;
	setSelectBackup: ( backup: ActivityLogEntry | null ) => void;
} ) {
	const [ view, setView ] = useState< View >( {
		type: 'list',
		fields: [ 'date', 'content_text' ],
		mediaField: 'icon',
		titleField: 'title',
		perPage: 10,
	} );

	const { data: activityLog = [], isLoading: isLoadingActivityLog } = useQuery(
		siteRewindableActivityLogEntriesQuery( site.ID )
	);

	const fields = getFields();
	const { data: filteredData, paginationInfo } = filterSortAndPaginate( activityLog, view, fields );

	useEffect( () => {
		if ( ! isLoadingActivityLog && activityLog.length > 0 && ! selectedBackup ) {
			const firstBackup = activityLog[ 0 ];
			setSelectBackup( firstBackup );
		}
	}, [ isLoadingActivityLog, activityLog, selectedBackup, setSelectBackup ] );

	const onChangeSelection = ( selection: string[] ) => {
		const backup =
			selection.length > 0
				? activityLog.find( ( item ) => item.activity_id === selection[ 0 ] ) || null
				: null;
		setSelectBackup( backup );
	};

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
				searchLabel={ __( 'Search backups' ) }
				onChangeSelection={ onChangeSelection }
				selection={ selectedBackup ? [ selectedBackup.activity_id ] : [] }
			/>
		</DataViewsCard>
	);
}

function BackupDetails( { selectedBackup }: { selectedBackup: ActivityLogEntry } ) {
	const formattedTime = useFormattedTime( selectedBackup.published, {
		dateStyle: 'medium',
		timeStyle: 'short',
	} );

	return (
		<Card>
			<CardHeader>
				<SectionHeader
					title={ selectedBackup.summary }
					decoration={ <Icon icon={ gridiconToWordPressIcon( selectedBackup.gridicon ) } /> }
				/>
			</CardHeader>
			<VStack className="dashboard-backups__details">
				<Text size={ 14 } weight={ 500 }>
					{ selectedBackup.content.text }
				</Text>
				<HStack alignment="left" spacing={ 4 }>
					<Text variant="muted">{ formattedTime }</Text>
					{ selectedBackup.actor?.name && (
						<Text variant="muted">
							{ __( 'By' ) } { selectedBackup.actor.name }
						</Text>
					) }
				</HStack>
			</VStack>
		</Card>
	);
}

function BackupsLayout( { site }: { site: Site } ) {
	const [ selectedBackup, setSelectedBackup ] = useState< ActivityLogEntry | null >( null );

	return (
		<Grid columns={ 2 }>
			<Backups
				site={ site }
				selectedBackup={ selectedBackup }
				setSelectBackup={ setSelectedBackup }
			/>
			{ selectedBackup && <BackupDetails selectedBackup={ selectedBackup } /> }
		</Grid>
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
				main={ <BackupsLayout site={ site } /> }
			/>
		</PageLayout>
	);
}

export default SiteBackups;
