/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import Table from 'woocommerce/components/table';
import TableRow from 'woocommerce/components/table/table-row';
import TableItem from 'woocommerce/components/table/table-item';
import Card from 'components/card';
import ErrorPanel from 'my-sites/stats/stats-error';
import { getWidgetPath, formatValue } from 'woocommerce/app/store-stats/utils';
import Pagination from 'components/pagination';
import { getStoreReferrers } from 'state/selectors';

class StoreStatsReferrerWidget extends Component {
	static propTypes = {
		data: PropTypes.array.isRequired,
		query: PropTypes.object.isRequired,
		siteId: PropTypes.number,
		statType: PropTypes.string.isRequired,
		unitSelectedDate: PropTypes.string.isRequired,
		unit: PropTypes.string.isRequired,
		queryParams: PropTypes.object.isRequired,
		slug: PropTypes.string.isRequired,
		pageType: PropTypes.string.isRequired,
		paginate: PropTypes.bool,
		selectedIndex: PropTypes.number,
		selectedReferrer: PropTypes.string,
	};

	state = {
		page: 1,
	};

	isPreCollection( date ) {
		const { moment } = this.props;
		return moment( date ).isBefore( moment( '2018-02-01' ) );
	}

	hasNosaraJobRun( date ) {
		const { moment } = this.props;
		const nowUtc = moment().utc();
		const daysOffsetFromUtc = nowUtc.hour() >= 10 ? 1 : 2;
		const lastValidDay = nowUtc.subtract( daysOffsetFromUtc, 'days' );
		return lastValidDay.isAfter( moment( date ) );
	}

	getEmptyDataMessage( date ) {
		const { translate, slug, queryParams, pageType } = this.props;
		if ( ! this.hasNosaraJobRun( date ) ) {
			const href = `/store/stats/${ pageType }${ getWidgetPath( 'week', slug, queryParams ) }`;
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
		return this.isPreCollection( date )
			? [ translate( 'Referral data isn’t available before Jetpack v5.9 (March 2018)' ) ]
			: [ translate( 'No referral activity on this date' ) ];
	}

	paginate = data => {
		const { paginate, limit } = this.props;
		if ( ! paginate ) {
			return data.slice( 0, limit || data.length );
		}
		const { page } = this.state;
		const start = ( page - 1 ) * limit;
		const end = start + limit;
		return data.slice( start, end );
	};

	onPageClick = pageNumber => {
		this.setState( {
			page: pageNumber,
		} );
	};

	setPage( { selectedIndex, limit } ) {
		if ( this.props.paginate ) {
			this.setState( {
				page: Math.floor( selectedIndex / limit ) + 1,
			} );
		}
	}

	componentWillMount() {
		this.setPage( this.props );
	}

	componentWillReceiveProps( nextProps ) {
		this.setPage( nextProps );
	}

	render() {
		const {
			data,
			unitSelectedDate,
			translate,
			unit,
			slug,
			queryParams,
			limit,
			paginate,
			selectedReferrer,
		} = this.props;
		const { page } = this.state;
		const basePath = '/store/stats/referrers';
		if ( data.length === 0 ) {
			const messages = this.getEmptyDataMessage( unitSelectedDate );
			return (
				<Card className="store-stats-referrer-widget stats-module is-showing-error has-no-data">
					<ErrorPanel message={ messages.shift() }>{ messages }</ErrorPanel>
				</Card>
			);
		}
		const paginatedData = this.paginate( data );
		const header = (
			<TableRow isHeader>
				<TableItem isHeader isTitle>
					{ translate( 'Source' ) }
				</TableItem>
				<TableItem isHeader>{ translate( 'Gross Sales' ) }</TableItem>
			</TableRow>
		);
		return (
			<Card className="store-stats-referrer-widget">
				<Table header={ header } compact>
					{ paginatedData.map( d => {
						const widgetPath = getWidgetPath(
							unit,
							slug,
							Object.assign( {}, queryParams, { referrer: d.referrer } )
						);
						const href = `${ basePath }${ widgetPath }`;
						return (
							<TableRow
								key={ d.referrer }
								href={ href }
								className={ classnames( {
									'is-selected': selectedReferrer === d.referrer,
								} ) }
							>
								<TableItem isTitle>{ d.referrer }</TableItem>
								<TableItem>{ formatValue( d.sales, 'currency', d.currency ) }</TableItem>
							</TableRow>
						);
					} ) }
				</Table>
				{ paginate && (
					<Pagination
						compact
						page={ page }
						perPage={ limit }
						total={ data.length }
						pageClick={ this.onPageClick }
					/>
				) }
			</Card>
		);
	}
}

export default connect( ( state, ownProps ) => {
	const { fetchedData } = ownProps;
	return {
		data: fetchedData || getStoreReferrers( state, ownProps ),
	};
} )( localize( StoreStatsReferrerWidget ) );
