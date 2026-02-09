import { siteScanHistoryQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import { __, sprintf } from '@wordpress/i18n';
import { usePersistentView } from '../../app/hooks/use-persistent-view';
import { siteScanHistoryRoute } from '../../app/router/sites';
import { DataViews, DataViewsEmptyState } from '../../components/dataviews';
import noThreatsIllustration from '../scan-active/no-threats-illustration.svg';
import { getActions } from './dataviews/actions';
import { getFields } from './dataviews/fields';
import type { Threat, Site } from '@automattic/api-core';
import type { View } from '@wordpress/dataviews';

interface ScanHistoryDataViewsProps {
	site: Site;
	timezoneString?: string;
	gmtOffset?: number;
}

const defaultView: View = {
	type: 'table',
	fields: [ 'status', 'fixed_on', 'threat', 'severity' ],
	perPage: 10,
	sort: {
		field: 'fixed_on',
		direction: 'desc',
	},
	layout: {
		density: 'balanced',
		styles: {
			status: {
				maxWidth: '100px',
			},
			threat: {
				minWidth: '500px',
			},
			fixed_on: {
				maxWidth: '175px',
				minWidth: '160px',
			},
		},
	},
	showLevels: false,
};

export function ScanHistoryDataViews( {
	site,
	timezoneString,
	gmtOffset,
}: ScanHistoryDataViewsProps ) {
	const { data: scanHistory, isLoading } = useQuery( siteScanHistoryQuery( site.ID ) );
	const threats = scanHistory?.threats || [];

	const searchParams = siteScanHistoryRoute.useSearch();
	const { view, updateView, resetView } = usePersistentView( {
		slug: 'site-scan-history',
		defaultView,
		queryParams: searchParams,
	} );
	const fields = getFields( timezoneString, gmtOffset );
	const actions = getActions( site );
	const { data: filteredData, paginationInfo } = filterSortAndPaginate( threats, view, fields );

	const NoArchivedThreatsFound = () => {
		let title = __( 'No history yet' );
		let description = __( 'So far, there are no archived threats on your site.' );

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
				description = __( 'No archived threats found for the selected filters.' );
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
			empty={ <NoArchivedThreatsFound /> }
			fields={ fields }
			getItemId={ ( item ) => item.id.toString() }
			isLoading={ isLoading }
			onChangeView={ updateView }
			onResetView={ resetView }
			paginationInfo={ paginationInfo }
			searchLabel={ __( 'Search' ) }
			view={ view }
		/>
	);
}
