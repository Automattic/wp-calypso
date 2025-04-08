import config from '@automattic/calypso-config';
import { SimplifiedSegmentedControl, StatsCard } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { comment } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import React, { useState } from 'react';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import { STAT_TYPE_COMMENTS } from 'calypso/my-sites/stats/constants';
import StatsInfoArea from 'calypso/my-sites/stats/features/modules/shared/stats-info-area';
import { useShouldGateStats } from 'calypso/my-sites/stats/hooks/use-should-gate-stats';
import StatsCardUpsell from 'calypso/my-sites/stats/stats-card-upsell';
import StatsListCard from 'calypso/my-sites/stats/stats-list/stats-list-card';
import { useSelector } from 'calypso/state';
import {
	isRequestingSiteStatsForQuery,
	getSiteStatsNormalizedData,
} from 'calypso/state/stats/lists/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import EmptyModuleCard from '../../../components/empty-module-card/empty-module-card';
import { INSIGHTS_SUPPORT_URL, JETPACK_SUPPORT_URL_INSIGHTS } from '../../../const';
import StatsCardSkeleton from '../shared/stats-card-skeleton';
import type { StatsDefaultModuleProps, StatsStateProps } from '../types';

import './styles.scss';

type CommentActionType = {
	type: string;
	data: boolean;
};

type CommentDataAuthors< T = string > = {
	label: string;
	value: T;
	iconClassName: string;
	icon: string;
	link: string;
	className: string;
	actions: CommentActionType[];
};

type CommentDataPosts< T = string > = {
	label: string;
	value: T;
	page: string;
	actions: CommentActionType[];
};

type CommentData = {
	authors: CommentDataAuthors[];
	posts: CommentDataPosts[];
};

type HeaderToggleOptionType = {
	value: string;
	label: string;
};

const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );
const supportUrl = isOdysseyStats
	? `${ JETPACK_SUPPORT_URL_INSIGHTS }#comments`
	: INSIGHTS_SUPPORT_URL;

const StatsComments: React.FC< StatsDefaultModuleProps > = ( { className } ) => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId ) as number;
	const statType = STAT_TYPE_COMMENTS;
	const moduleTitle = translate( 'Comments' );
	const [ activeFilter, setActiveFilter ] = useState< string >( 'top-authors' );

	// Use StatsModule to display paywall upsell.
	const shouldGateStatsModule = useShouldGateStats( statType );

	const isRequestingData = useSelector( ( state: StatsStateProps ) =>
		isRequestingSiteStatsForQuery( state, siteId, statType, {} )
	);
	const commentsStatsData = useSelector( ( state: StatsStateProps ) =>
		getSiteStatsNormalizedData( state, siteId, statType, {} )
	) as CommentData;
	const selectOptions = [
		{
			value: 'top-authors',
			label: translate( 'By authors' ),
		},
		{
			value: 'top-content',
			label: translate( 'By posts & pages' ),
		},
	];

	const commentsAuthors = commentsStatsData?.authors;
	const commentsPosts = commentsStatsData?.posts;

	const data = activeFilter === 'top-authors' ? commentsAuthors : commentsPosts;

	const hasPosts = data?.length > 0;

	const dataForBars = data?.map( ( item ) => ( {
		...item,
		value: parseInt( item.value, 10 ),
	} ) ) as CommentDataAuthors< number >[] | CommentDataPosts< number >[];

	const handleFilterChange = ( selection: HeaderToggleOptionType ) => {
		setActiveFilter( selection.value );
	};

	return (
		<>
			{ ! shouldGateStatsModule && siteId && statType && (
				<QuerySiteStats statType={ statType } siteId={ siteId } />
			) }
			{ isRequestingData && (
				<StatsCardSkeleton
					isLoading={ isRequestingData }
					className={ className }
					title={ moduleTitle }
					type={ 3 }
				/>
			) }
			{ ( ( ! isRequestingData && hasPosts ) || shouldGateStatsModule ) && (
				// show data or an overlay
				// @ts-expect-error TODO: Refactor StatsListCard with TypeScript.
				<StatsListCard
					moduleType="comments"
					data={ dataForBars }
					title={ translate( 'Comments' ) }
					titleNodes={
						<StatsInfoArea>
							{ translate(
								'Learn about the {{link}}comments{{/link}} your site receives by authors, posts, and pages.',
								{
									comment: '{{link}} links to support documentation.',
									components: {
										link: <a target="_blank" rel="noreferrer" href={ localizeUrl( supportUrl ) } />,
									},
									context: 'Stats: Info box label when the Comments module is empty',
								}
							) }
						</StatsInfoArea>
					}
					mainItemLabel={ translate( 'Author' ) }
					metricLabel={ translate( 'Comments' ) }
					splitHeader
					useShortNumber
					toggleControl={
						// @ts-expect-error TODO: Refactor SimplifiedSegmentedControl with TypeScript - onSelect assumed type is incorrect.
						<SimplifiedSegmentedControl options={ selectOptions } onSelect={ handleFilterChange } />
					}
					className={ clsx( 'stats__modernised-comments', className ) }
					showLeftIcon
					overlay={
						siteId &&
						shouldGateStatsModule && (
							<StatsCardUpsell
								className="stats-module__upsell"
								statType={ STAT_TYPE_COMMENTS }
								siteId={ siteId }
							/>
						)
					}
				/>
			) }
			{ ! isRequestingData && ! hasPosts && ! shouldGateStatsModule && (
				// show empty state
				<StatsCard
					className={ className }
					title={ moduleTitle }
					isEmpty
					emptyMessage={
						<EmptyModuleCard
							icon={ comment }
							description={ translate(
								'Learn about the {{link}}comments{{/link}} your site receives by authors, posts, and pages.',
								{
									comment: '{{link}} links to support documentation.',
									components: {
										link: <a target="_blank" rel="noreferrer" href={ localizeUrl( supportUrl ) } />,
									},
									context: 'Stats: Info box label when the Comments module is empty',
								}
							) }
						/>
					}
				/>
			) }
		</>
	);
};

export default StatsComments;
