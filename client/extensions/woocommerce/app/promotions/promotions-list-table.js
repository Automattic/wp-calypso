/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PromotionsListRow from './promotions-list-row';
import Table from 'woocommerce/components/table';
import TableRow from 'woocommerce/components/table/table-row';
import TableItem from 'woocommerce/components/table/table-item';

const PromotionsListTable = ( { site, promotions, translate } ) => {
	const headings = [
		translate( 'Promotion' ),
		translate( 'Type', { context: 'noun' } ),
		translate( 'Timeframe' ),
	];

	const tableHeader = (
		<TableRow isHeader className={ classNames( { 'promotions__list-placeholder': ! promotions } ) }>
			{ headings.map( ( item, i ) => (
				<TableItem isHeader key={ i } isTitle={ 0 === i }>
					{ item }
				</TableItem>
			) ) }
		</TableRow>
	);

	return (
		<div>
			<Table
				header={ tableHeader }
				className={ classNames( { 'is-requesting': ! promotions } ) }
				horizontalScroll
			>
				{ promotions &&
					promotions.map( ( promotion, i ) => (
						<PromotionsListRow key={ i } site={ site } promotion={ promotion } />
					) ) }
			</Table>
			{ ! promotions && <div className="promotions__list-placeholder" /> }
		</div>
	);
};

PromotionsListTable.propTypes = {
	site: PropTypes.shape( {
		slug: PropTypes.string,
	} ),
	promotions: PropTypes.array,
};

export default localize( PromotionsListTable );
