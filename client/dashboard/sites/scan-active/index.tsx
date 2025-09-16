import { siteScanQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack, __experimentalText as Text } from '@wordpress/components';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __, sprintf } from '@wordpress/i18n';
import { useState } from 'react';
import { getActions } from './dataviews/actions';
import { getFields } from './dataviews/fields';
import noThreatsIllustration from './no-threats-illustration.svg';
import type { Threat, Site } from '@automattic/api-core';
import type { View } from '@wordpress/dataviews';

export function ActiveThreatsDataViews( { site }: { site: Site } ) {
	const [ view, setView ] = useState< View >( {
		type: 'table',
		fields: [ 'severity', 'threat', 'first_detected', 'auto_fix' ],
		perPage: 10,
		sort: { field: 'severity', direction: 'desc' },
	} );

	const getEmptyMessage = () => {
		if ( view.search ) {
			return sprintf(
				/** translators: %s: search query string */
				__( 'No active threats found. Your search for "%s" did not return any results.' ),
				view.search
			);
		}
		if ( view.filters && view.filters.length > 0 ) {
			return __( 'No active threats found with the current filters.' );
		}
		return __( 'No threats found' );
	};

	const { data: threats = [], isLoading } = useQuery( {
		...siteScanQuery( site.ID ),
		select: ( scan ) => scan.threats.filter( ( threat ) => threat.status === 'current' ),
	} );

	const fields = getFields();
	const actions = getActions();
	const { data: filteredData, paginationInfo } = filterSortAndPaginate( threats, view, fields );

	if ( ! isLoading && threats.length === 0 ) {
		return (
			<VStack spacing={ 10 } alignment="center" style={ { padding: '40px 0' } }>
				<img src={ noThreatsIllustration } alt={ __( 'No threats found illustration' ) } />
				<Text>{ getEmptyMessage() }</Text>
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
