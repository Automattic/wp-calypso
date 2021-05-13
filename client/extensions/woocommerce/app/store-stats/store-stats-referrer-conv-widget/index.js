/**
 * External dependencies
 */
import React, { Fragment } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import TableRow from 'woocommerce/components/table/table-row';
import TableItem from 'woocommerce/components/table/table-item';
import { formatValue } from 'woocommerce/app/store-stats/utils';
import StoreStatsReferrerWidgetBase from '../store-stats-referrer-widget-base';

const StoreStatsReferrerConvWidget = ( props ) => {
	const { translate } = props;
	const header = (
		<TableRow isHeader>
			<TableItem isHeader className="store-stats-referrer-conv-widget__referrer">
				{ translate( 'Source' ) }
			</TableItem>
			<TableItem isHeader className="store-stats-referrer-conv-widget__views">
				{ translate( 'Views' ) }
			</TableItem>
			<TableItem isHeader className="store-stats-referrer-conv-widget__delta">
				{ '→' }
			</TableItem>
			<TableItem isHeader className="store-stats-referrer-conv-widget__carts">
				{ translate( 'Carts' ) }
			</TableItem>
			<TableItem isHeader className="store-stats-referrer-conv-widget__delta">
				{ '→' }
			</TableItem>
			<TableItem isHeader className="store-stats-referrer-conv-widget__purchases">
				{ translate( 'Purchases' ) }
			</TableItem>
		</TableRow>
	);

	return (
		<StoreStatsReferrerWidgetBase
			className="store-stats-referrer-conv-widget"
			header={ header }
			{ ...props }
		>
			{ ( d ) => (
				<Fragment>
					<TableItem className="store-stats-referrer-conv-widget__referrer">
						{ d.referrer }
					</TableItem>
					<TableItem className="store-stats-referrer-conv-widget__views">
						{ formatValue( d.product_views, 'number', 0 ) }
					</TableItem>
					<TableItem className="store-stats-referrer-conv-widget__delta">
						{ `${
							d.product_views !== 0
								? Math.abs( Math.round( ( d.add_to_carts / d.product_views ) * 100 ) )
								: '-'
						}%` }
					</TableItem>
					<TableItem className="store-stats-referrer-conv-widget__carts">
						{ formatValue( d.add_to_carts, 'number', 0 ) }
					</TableItem>
					<TableItem className="store-stats-referrer-conv-widget__delta">
						{ `${
							d.add_to_carts !== 0
								? Math.abs( Math.round( ( d.product_purchases / d.add_to_carts ) * 100 ) )
								: '-'
						}%` }
					</TableItem>
					<TableItem className="store-stats-referrer-conv-widget__purchases">
						{ formatValue( d.product_purchases, 'number', 0 ) }
					</TableItem>
				</Fragment>
			) }
		</StoreStatsReferrerWidgetBase>
	);
};

export default localize( StoreStatsReferrerConvWidget );
