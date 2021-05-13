/**
 * External dependencies
 */
import React, { Fragment } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import StoreStatsReferrerWidgetBase from '../store-stats-referrer-widget-base';
import TableRow from 'woocommerce/components/table/table-row';
import TableItem from 'woocommerce/components/table/table-item';
import { formatValue } from 'woocommerce/app/store-stats/utils';

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
