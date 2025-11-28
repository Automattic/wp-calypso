import { siteScanQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __, sprintf } from '@wordpress/i18n';
import { useMemo, useState } from 'react';
import { DataViewsEmptyState } from '../../components/dataviews';
import { useTimeSince } from '../../components/time-since';
import { getActions } from './dataviews/actions';
import { getFields } from './dataviews/fields';
import noThreatsIllustration from './no-threats-illustration.svg';
import type { Threat, Site } from '@automattic/api-core';
import type { View } from '@wordpress/dataviews';

interface ActiveThreatsDataViewsProps {
	site: Site;
	timezoneString?: string;
	gmtOffset?: number;
}

export function ActiveThreatsDataViews( {
	site,
	timezoneString,
	gmtOffset,
}: ActiveThreatsDataViewsProps ) {
	const [ view, setView ] = useState< View >( {
		type: 'table',
		fields: [ 'severity', 'threat', 'first_detected', 'auto_fix' ],
		perPage: 10,
		sort: { field: 'severity', direction: 'desc' },
		layout: {
			styles: {
				threat: {
					minWidth: '500px',
				},
				first_detected: {
					maxWidth: '175px',
					minWidth: '140px',
				},
			},
		},
	} );

	const [ selection, setSelection ] = useState< string[] >( [] );
	const { data: scan, isLoading } = useQuery( siteScanQuery( site.ID ) );
	const threats = scan?.threats?.filter( ( threat ) => threat.status === 'current' ) || [];

	const fields = getFields( timezoneString, gmtOffset );
	const actions = useMemo( () => getActions( site, selection.length ), [ site, selection.length ] );
	const { data: filteredData, paginationInfo } = filterSortAndPaginate( threats, view, fields );
	const lastScanTime = scan?.most_recent?.timestamp;
	const recentScanRelativeTime = useTimeSince( lastScanTime || '' );

	const NoActiveThreatsFound = () => {
		let title = __( 'Don’t worry about a thing' );
		let description = sprintf(
			/** translators: %s: relative time string like "2 hours ago" */
			__( 'The last scan ran %s and found no security issues.' ),
			recentScanRelativeTime
		);

		if ( view.search || view.filters ) {
			title = __( 'No archived threats found' );

			if ( view.search ) {
				description = sprintf(
					/** translators: %s: search query string */
					__( 'Your search for "%s" did not return any results.' ),
					view.search
				);
			}

			if ( view.filters ) {
				description = __( 'No active threats found for the selected filters.' );
			}
		}

		return (
			<DataViewsEmptyState
				title={ title }
				description={ description }
				illustration={
					<img
						src={ noThreatsIllustration }
						alt={ __( 'No threats found illustration' ) }
						width={ 408 }
						height={ 280 }
					/>
				}
			/>
		);
	};

	return (
		<DataViews< Threat >
			actions={ actions }
			data={ filteredData }
			defaultLayouts={ { table: {} } }
			empty={ <NoActiveThreatsFound /> }
			fields={ fields }
			getItemId={ ( item ) => item.id.toString() }
			isLoading={ isLoading }
			onChangeSelection={ setSelection }
			onChangeView={ setView }
			paginationInfo={ paginationInfo }
			searchLabel={ __( 'Search' ) }
			selection={ selection }
			view={ view }
		/>
	);
}
