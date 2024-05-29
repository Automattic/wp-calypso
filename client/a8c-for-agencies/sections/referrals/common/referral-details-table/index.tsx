import { useState } from 'react';
import { initialDataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/constants';
import ItemsDataViews from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews';
import type { ReferralPurchase } from '../../types';
import type { DataViewsColumn } from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews/interfaces';

import './style.scss';

interface Props {
	heading: string;
	items: ReferralPurchase[]; // Update this when we have more types
	fields: DataViewsColumn[];
}

export default function ReferralDetailsTable( { heading, items, fields }: Props ) {
	const [ dataViewsState, setDataViewsState ] = useState( initialDataViewsState );

	return (
		<div className="referrals-details-table__container redesigned-a8c-table">
			<div className="referrals-details-table__heading">{ heading }</div>
			<ItemsDataViews
				data={ {
					items,
					fields,
					pagination: {
						totalItems: 1,
						totalPages: 1,
					},
					enableSearch: false,
					actions: [],
					dataViewsState: dataViewsState,
					setDataViewsState: setDataViewsState,
				} }
			/>
		</div>
	);
}
