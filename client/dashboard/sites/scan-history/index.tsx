import { siteScanHistoryQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack, __experimentalText as Text } from '@wordpress/components';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __, sprintf } from '@wordpress/i18n';
import { useState } from 'react';
import noThreatsIllustration from '../scan-active/no-threats-illustration.svg';
import { getActions } from './dataviews/actions';
import { getFields } from './dataviews/fields';
import type { Threat, Site } from '@automattic/api-core';
import type { View } from '@wordpress/dataviews';

export function ScanHistoryDataViews( { site }: { site: Site } ) {
	const [ view, setView ] = useState< View >( {
		type: 'table',
		fields: [ 'status', 'fixed_on', 'threat', 'severity' ],
		perPage: 10,
		sort: {
			field: 'fixed_on',
			direction: 'desc',
		},
	} );

	const getEmptyMessage = () => {
		if ( view.search ) {
			return sprintf(
				/** translators: %s: search query string */
				__( 'Your search for "%s" did not return any results.' ),
				view.search
			);
		}
		return __( 'No archived threats found for the selected filters.' );
	};

	const { data: scanHistory, isLoading } = useQuery( siteScanHistoryQuery( site.ID ) );
	const threats = scanHistory?.threats || [];

	const fields = getFields();
	const actions = getActions();
	const { data: filteredData, paginationInfo } = filterSortAndPaginate( threats, view, fields );

	if ( ! isLoading && threats.length === 0 ) {
		return (
			<VStack spacing={ 10 } alignment="center" style={ { padding: '40px 0' } }>
				<img src={ noThreatsIllustration } alt={ __( 'No threats found illustration' ) } />
				<VStack alignment="center" spacing={ 2 }>
					<Text weight="bold">{ __( 'No history yet' ) }</Text>
					<Text>{ __( 'So far, there are no archived threats on your site.' ) }</Text>
				</VStack>
			</VStack>
		);
	}

	return (
		<DataViews< Threat >
			actions={ actions }
			data={ filteredData }
			defaultLayouts={ { table: {} } }
			empty={ getEmptyMessage() }
			fields={ fields }
			getItemId={ ( item ) => item.id.toString() }
			isLoading={ isLoading }
			onChangeView={ setView }
			paginationInfo={ paginationInfo }
			searchLabel={ __( 'Search' ) }
			view={ view }
		/>
	);
}
