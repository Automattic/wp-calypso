import { localize } from 'i18n-calypso';
import { Fragment } from 'react';
import TableItem from '../../../components/table/table-item';
import TableRow from '../../../components/table/table-row';
import StoreStatsReferrerWidgetBase from '../store-stats-referrer-widget-base';
import { formatValue } from '../utils';

const StoreStatsReferrerWidget = ( props ) => {
	const { translate } = props;
	const header = (
		<TableRow isHeader>
			<TableItem isHeader isTitle>
				{ translate( 'Source' ) }
			</TableItem>
			<TableItem isHeader>{ translate( 'Gross Sales' ) }</TableItem>
		</TableRow>
	);
	return (
		<StoreStatsReferrerWidgetBase
			className="store-stats-referrer-widget"
			header={ header }
			{ ...props }
		>
			{ ( d ) => (
				<Fragment>
					<TableItem isTitle>{ d.referrer }</TableItem>
					<TableItem>{ formatValue( d.sales, 'currency', d.currency ) }</TableItem>
				</Fragment>
			) }
		</StoreStatsReferrerWidgetBase>
	);
};

export default localize( StoreStatsReferrerWidget );
