import { isEnabled } from '@automattic/calypso-config';
import { localizeUrl } from '@automattic/i18n-utils';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import isAtomicSite from 'calypso/state/selectors/is-site-wpcom-atomic';
import { getSiteSlug, isAdminInterfaceWPAdmin, isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { SUBSCRIBERS_SUPPORT_URL } from '../const';
import useSubscribersTotalsQueries from '../hooks/use-subscribers-totals-query';
import ErrorPanel from '../stats-error';
import StatsListCard from '../stats-list/stats-list-card';
import StatsModulePlaceholder from '../stats-module/placeholder';

import './style.scss';

const StatModuleFollowers = ( { className } ) => {
	const translate = useTranslate();

	// Selectors
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );
	const isAtomic = useSelector( ( state ) => isAtomicSite( state, siteId ) );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );
	const isAdminInterface = useSelector( ( state ) => isAdminInterfaceWPAdmin( state, siteId ) );

	const { data: subTotals, isLoading, isError: hasError } = useSubscribersTotalsQueries( siteId );

	const calculateOffset = useCallback(
		( pastValue ) => {
			const now = new Date();
			const value = new Date( pastValue );
			const difference = now.getTime() - value.getTime();

			const seconds = Math.floor( difference / 1000 );
			const minutes = Math.ceil( seconds / 60 );
			const hours = Math.floor( minutes / 60 );
			const days = Math.floor( hours / 24 );

			let result = '';

			if ( days > 0 ) {
				result = translate( '%d days', { args: days } );
			} else if ( hours > 0 ) {
				result = translate( '%d hours', { args: hours } );
			} else if ( minutes > 0 ) {
				result = translate( '%d minutes', { args: minutes } );
			}

			return result;
		},
		[ translate ]
	);

	const noData = ! subTotals.subscribers.length;
	const summaryPageSlug = siteSlug || '';
	const useJetpackCloudLinks =
		isAtomic || isJetpack || ( isEnabled( 'jetpack/manage-simple-sites' ) && isAdminInterface );
	const subscriberManagementUrl = useJetpackCloudLinks
		? `https://cloud.jetpack.com/subscribers/${ summaryPageSlug }`
		: `https://wordpress.com/subscribers/${ summaryPageSlug }`;

	return (
		<StatsListCard
			moduleType="followers"
			data={ subTotals.subscribers.map( ( dataPoint ) => ( {
				...dataPoint,
				value: calculateOffset( dataPoint.value?.value ),
			} ) ) }
			usePlainCard
			hasNoBackground
			title={ translate( 'Subscribers' ) }
			emptyMessage={ translate(
				'Once you get a few, {{link}}your subscribers{{/link}} will appear here.',
				{
					comment: '{{link}} links to support documentation.',
					components: {
						link: (
							<a
								target="_blank"
								rel="noreferrer"
								href={ localizeUrl( `${ SUBSCRIBERS_SUPPORT_URL }#subscriber-stats` ) }
							/>
						),
					},
					context: 'Stats: Info box label when the Subscribers module is empty',
				}
			) }
			mainItemLabel={ translate( 'Subscriber' ) }
			metricLabel={ translate( 'Since' ) }
			splitHeader
			showMore={ {
				url: subscriberManagementUrl,
				label: translate( 'Manage subscribers' ),
			} }
			error={
				noData &&
				! hasError &&
				! isLoading && (
					<ErrorPanel className="is-empty-message" message={ translate( 'No subscribers' ) } />
				)
			}
			loader={ isLoading && <StatsModulePlaceholder isLoading={ isLoading } /> }
			className={ clsx( 'stats__modernised-followers', className ) }
			showLeftIcon
		/>
	);
};

export default StatModuleFollowers;
