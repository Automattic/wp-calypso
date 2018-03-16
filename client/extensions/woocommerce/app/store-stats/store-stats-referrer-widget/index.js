/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { find } from 'lodash';
import { max as d3Max } from 'd3-array';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getSiteStatsNormalizedData } from 'state/stats/lists/selectors';
import Table from 'woocommerce/components/table';
import TableRow from 'woocommerce/components/table/table-row';
import TableItem from 'woocommerce/components/table/table-item';
import HorizontalBar from 'woocommerce/components/d3/horizontal-bar';
import Card from 'components/card';
import ErrorPanel from 'my-sites/stats/stats-error';
import { sortBySales } from 'woocommerce/app/store-stats/referrers/helpers';

class StoreStatsReferrerWidget extends Component {
	static propTypes = {
		data: PropTypes.array.isRequired,
		query: PropTypes.object.isRequired,
		siteId: PropTypes.number,
		statType: PropTypes.string.isRequired,
		selectedDate: PropTypes.string.isRequired,
	};

	isPreCollection( selectedData ) {
		const { moment } = this.props;
		return moment( selectedData.date ).isBefore( moment( '2018-02-01' ) );
	}

	hasNosaraJobRun( selectedData ) {
		const { moment } = this.props;
		const nowUtc = moment().utc();
		const daysOffsetFromUtc = nowUtc.hour() >= 10 ? 1 : 2;
		const lastValidDay = nowUtc.subtract( daysOffsetFromUtc, 'days' );
		return lastValidDay.isAfter( moment( selectedData.date ) );
	}

	getEmptyDataMessage( selectedData ) {
		const { slugAndQuery, translate } = this.props;
		if ( ! this.hasNosaraJobRun( selectedData ) ) {
			const href = `/store/stats/orders/week${ slugAndQuery }`;
			const primary = translate( 'Data is being processed – check back soon' );
			const secondary = translate(
				'Expand to a {{a}}wider{{/a}} view to see your latest referrers',
				{
					components: {
						a: <a href={ href } />,
					},
				}
			);
			return [ primary, <p key="link">{ secondary }</p> ];
		}
		return this.isPreCollection( selectedData )
			? [ translate( 'Referral data isn’t available before Jetpack v5.9 (March 2018)' ) ]
			: [ translate( 'No referral activity on this date' ) ];
	}

	render() {
		const { data, selectedDate, translate } = this.props;
		const selectedData = find( data, d => d.date === selectedDate ) || { data: [] };
		if ( selectedData.data.length === 0 ) {
			const messages = this.getEmptyDataMessage( selectedData );
			return (
				<Card className="store-stats-referrer-widget stats-module is-showing-error has-no-data">
					<ErrorPanel message={ messages.shift() }>{ messages }</ErrorPanel>
				</Card>
			);
		}
		const sortedAndTrimmedData = sortBySales( selectedData.data, 5 );
		const extent = [ 0, d3Max( sortedAndTrimmedData.map( d => d.sales ) ) ];
		const header = (
			<TableRow isHeader>
				<TableItem isHeader isTitle>
					{ translate( 'Source' ) }
				</TableItem>
				<TableItem isHeader>{ translate( 'Gross Sales' ) }</TableItem>
			</TableRow>
		);
		return (
			<Table className="store-stats-referrer-widget" header={ header } compact>
				{ sortedAndTrimmedData.map( d => {
					return (
						<TableRow key={ d.referrer }>
							<TableItem isTitle>{ d.referrer }</TableItem>
							<TableItem>
								<HorizontalBar
									extent={ extent }
									data={ d.sales }
									currency={ d.currency }
									height={ 20 }
								/>
							</TableItem>
						</TableRow>
					);
				} ) }
			</Table>
		);
	}
}

export default connect( ( state, { siteId, statType, query } ) => {
	return {
		data: getSiteStatsNormalizedData( state, siteId, statType, query ),
	};
} )( localize( StoreStatsReferrerWidget ) );
