import { Button } from '@wordpress/components';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useMemo, useState } from 'react';
import A4AModal from 'calypso/a8c-for-agencies/components/a4a-modal';
import { initialDataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/constants';
import ItemsDataViews from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews';
import { DataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews/interfaces';
import { A4A_SITES_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import FormRadio from 'calypso/components/forms/form-radio';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import useConnectedSites from './hooks/use-connected-sites';
import type { Field } from '@wordpress/dataviews';

type SiteItem = {
	id: number;
	url: string;
};

function AmplifySiteTable( {
	selectedSite,
	setSelectedSite,
}: {
	selectedSite: SiteItem | null;
	setSelectedSite: ( site: SiteItem ) => void;
} ) {
	const { sites, isLoading } = useConnectedSites();

	const [ dataViewsState, setDataViewsState ] = useState< DataViewsState >( {
		...initialDataViewsState,
		fields: [ 'site' ],
	} );

	const items: SiteItem[] = useMemo(
		() => sites.map( ( s ) => ( { id: s.id, url: s.url } ) ),
		[ sites ]
	);

	const fields: Field< SiteItem >[] = useMemo(
		() => [
			{
				id: 'site',
				label: __( 'Site' ),
				getValue: ( { item }: { item: SiteItem } ) => item.url,
				render: ( { item }: { item: SiteItem } ) => (
					<div>
						<FormRadio
							htmlFor={ `amplify-site-${ item.id }` }
							id={ `amplify-site-${ item.id }` }
							checked={ selectedSite?.id === item.id }
							onChange={ () => setSelectedSite( item ) }
							label={ item.url }
						/>
					</div>
				),
				enableGlobalSearch: true,
				enableHiding: false,
				enableSorting: false,
			},
		],
		[ selectedSite?.id, setSelectedSite ]
	);

	const { data: paginatedItems, paginationInfo } = useMemo(
		() => filterSortAndPaginate( items, dataViewsState, fields ),
		[ items, dataViewsState, fields ]
	);

	return (
		<div className="redesigned-a8c-table show-overflow-overlay search-enabled">
			<ItemsDataViews
				isLoading={ isLoading }
				data={ {
					items: paginatedItems,
					fields,
					getItemId: ( item: SiteItem ) => `${ item.id }`,
					pagination: paginationInfo,
					enableSearch: true,
					actions: [],
					dataViewsState,
					setDataViewsState,
					defaultLayouts: { table: {} },
				} }
			/>
		</div>
	);
}

type Props = {
	onClose: () => void;
	onSiteSelected: ( url: string ) => void;
};

export default function AmplifyAddSiteModal( { onClose, onSiteSelected }: Props ) {
	const dispatch = useDispatch();
	const [ selectedSite, setSelectedSite ] = useState< SiteItem | null >( null );

	const handleAmplify = () => {
		if ( ! selectedSite ) {
			return;
		}
		dispatch(
			recordTracksEvent( 'calypso_a4a_amplify_audit_open', {
				site_url: selectedSite.url,
			} )
		);
		onSiteSelected( selectedSite.url );
	};

	return (
		<A4AModal
			title={ __( 'Which site would you like to amplify?' ) }
			subtile={ createInterpolateElement(
				/* translators: "Sites Dashboard" is a link to the connected sites management page. */
				__(
					"If you don't see the site in the list, connect it first via the <a>Sites Dashboard</a>."
				),
				{
					a: <a href={ A4A_SITES_LINK } />,
				}
			) }
			onClose={ onClose }
			extraActions={
				<Button variant="primary" onClick={ handleAmplify } disabled={ ! selectedSite }>
					{ __( 'Amplify it' ) }
				</Button>
			}
		>
			<AmplifySiteTable selectedSite={ selectedSite } setSelectedSite={ setSelectedSite } />
		</A4AModal>
	);
}
