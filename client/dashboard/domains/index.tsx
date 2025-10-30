import { DomainSubtype } from '@automattic/api-core';
import { domainsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useState, useMemo } from 'react';
import { useAuth } from '../app/auth';
import { useAppContext } from '../app/context';
import { DataViewsCard } from '../components/dataviews-card';
import { OptInWelcome } from '../components/opt-in-welcome';
import { PageHeader } from '../components/page-header';
import PageLayout from '../components/page-layout';
import { AddDomainButton } from './add-domain-button';
import { useActions, useFields, DEFAULT_VIEW, DEFAULT_LAYOUTS } from './dataviews';
import type { DomainsView } from './dataviews';
import type { DomainSummary, Site } from '@automattic/api-core';

export function getDomainId( domain: DomainSummary ): string {
	return `${ domain.domain }-${ domain.blog_id }`;
}

function Domains() {
	const { user } = useAuth();
	const { queries } = useAppContext();
	const fields = useFields();
	const { data: sites } = useQuery( queries.sitesQuery() );
	const actions = useActions( { user, sites } );
	const [ view, setView ] = useState< DomainsView >( () => ( {
		...DEFAULT_VIEW,
		type: 'table',
		filters: [
			{
				field: 'owner',
				operator: 'isAny',
				value: [ 'owned-by-me' ],
			},
		],
	} ) );

	const sitesById = useMemo( () => {
		if ( ! sites ) {
			return {};
		}
		return sites.reduce( ( acc: Record< number, Site >, site ) => {
			acc[ site.ID ] = site;
			return acc;
		}, {} );
	}, [ sites ] );

	const { data: domains, isLoading } = useQuery( {
		...domainsQuery(),
		select: ( data ) => {
			return data.filter(
				( domain ) =>
					domain.subtype.id !== DomainSubtype.DEFAULT_ADDRESS && !! sitesById[ domain.blog_id ]
			);
		},
	} );

	const { data: filteredData, paginationInfo } = filterSortAndPaginate(
		domains ?? [],
		view,
		fields
	);

	return (
		<PageLayout
			header={ <PageHeader title={ __( 'Domains' ) } actions={ <AddDomainButton /> } /> }
			notices={ <OptInWelcome tracksContext="domains" /> }
		>
			<DataViewsCard>
				<DataViews< DomainSummary >
					data={ filteredData || [] }
					fields={ fields }
					onChangeView={ ( nextView ) => setView( () => nextView as DomainsView ) }
					view={ view }
					actions={ actions }
					search
					paginationInfo={ paginationInfo }
					getItemId={ getDomainId }
					isLoading={ isLoading }
					defaultLayouts={ DEFAULT_LAYOUTS }
				/>
			</DataViewsCard>
		</PageLayout>
	);
}

export default Domains;
