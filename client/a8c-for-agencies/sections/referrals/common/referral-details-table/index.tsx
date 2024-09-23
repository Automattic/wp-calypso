import { filterSortAndPaginate } from '@wordpress/dataviews';
import { useState, useMemo } from 'react';
import { initialDataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/constants';
import ItemsDataViews from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews';
import type { ReferralPurchase } from '../../types';
import type { Field } from '@wordpress/dataviews';

import './style.scss';

interface Props {
	items: ReferralPurchase[]; // Update this when we have more types
	fields: Field< ReferralPurchase >[];
}

export default function ReferralDetailsTable( { items, fields }: Props ) {
	const [ dataViewsState, setDataViewsState ] = useState( initialDataViewsState );

	const { data, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( items, dataViewsState, fields );
	}, [ items, dataViewsState, fields ] );

	return (
		<div className="referrals-details-table__container redesigned-a8c-table">
			<ItemsDataViews
				data={ {
					items: data,
					fields,
					pagination: paginationInfo,
					enableSearch: false,
					actions: [],
					dataViewsState: dataViewsState,
					setDataViewsState: setDataViewsState,
					defaultLayouts: { table: {} },
				} }
			/>
		</div>
	);
}
