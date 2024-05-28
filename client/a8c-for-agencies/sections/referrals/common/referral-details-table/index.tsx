import { DATAVIEWS_TABLE } from 'calypso/a8c-for-agencies/components/items-dashboard/constants';
import { DataViews } from 'calypso/components/dataviews';
import type { ReferralPurchase } from '../../types';
import type { DataViewsColumn } from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews/interfaces';

import './style.scss';

interface Props {
	heading: string;
	items: ReferralPurchase[]; // Update this when we have more types
	fields: DataViewsColumn[];
}

export default function ReferralDetailsTable( { heading, items, fields }: Props ) {
	return (
		<div className="referrals-details-table__container redesigned-a8c-table">
			<div className="referrals-details-table__heading">{ heading }</div>
			<DataViews
				data={ items }
				paginationInfo={ { totalItems: 1, totalPages: 1 } }
				fields={ fields }
				view={ {
					filters: [],
					sort: {
						field: '',
						direction: 'asc',
					},
					type: DATAVIEWS_TABLE,
					perPage: 1,
					page: 1,
					hiddenFields: [],
					layout: {},
				} }
				search={ false }
				supportedLayouts={ [ 'table' ] }
				actions={ [] }
			/>
		</div>
	);
}
