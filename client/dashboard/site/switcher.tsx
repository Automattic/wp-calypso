import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { sitesQuery } from '../app/queries';
import SiteIcon from '../site-icon';
import type { Site } from '../data/types';
import type { View } from '@wordpress/dataviews';

import './switcher.scss';

const fields = [
	{
		id: 'name',
		label: __( 'Site' ),
		enableGlobalSearch: true,
	},
	{
		id: 'icon.ico',
		label: __( 'Media' ),
		render: ( { item }: { item: Site } ) => <SiteIcon site={ item } size={ 24 } />,
	},
];

const DEFAULT_VIEW: View = {
	type: 'list',
	page: 1,
	perPage: 10,
	sort: {
		field: 'name',
		direction: 'asc',
	},
	titleField: 'name',
	mediaField: 'media',
};

export default function Switcher( { onClose }: { onClose: () => void } ) {
	const navigate = useNavigate();
	const sites = useQuery( sitesQuery() ).data;
	const [ view, setView ] = useState< View >( DEFAULT_VIEW );

	if ( ! sites ) {
		return __( 'Loading…' );
	}

	const { data: filteredData, paginationInfo } = filterSortAndPaginate( sites, view, fields );

	const onChangeSelection = async ( items: string[] ) => {
		await navigate( { to: `/sites/${ items[ 0 ] }` } );
		onClose();
	};

	return (
		<div className="site-switcher">
			<DataViews
				getItemId={ ( item ) => item.ID }
				data={ filteredData }
				fields={ fields }
				view={ view }
				onChangeView={ setView }
				onChangeSelection={ onChangeSelection }
				defaultLayouts={ { table: {} } }
				paginationInfo={ paginationInfo }
			/>
		</div>
	);
}
