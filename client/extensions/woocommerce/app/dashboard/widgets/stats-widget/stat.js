/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { findIndex } from 'lodash';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Delta from 'woocommerce/components/delta';
import formatCurrency from 'lib/format-currency';
import { isRequestingSiteStatsForQuery } from 'state/stats/lists/selectors';
import Sparkline from 'woocommerce/components/d3/sparkline';
import StatsModulePlaceholder from 'my-sites/stats/stats-module/placeholder';

class StatsWidgetStat extends Component {
	static propTypes = {
		site: PropTypes.shape( {
			id: PropTypes.number,
			slug: PropTypes.string,
		} ),
		label: PropTypes.string.isRequired,
		attribute: PropTypes.string.isRequired,
		type: PropTypes.string.isRequired,
		data: PropTypes.array.isRequired,
		date: PropTypes.string.isRequired,
		delta: PropTypes.object.isRequired,
	};

	renderDelta = () => {
		const { delta } = this.props;
		if ( ! delta || ( ! delta.classes && ! delta.direction ) ) {
			return null;
		}

		if ( delta.classes ) {
			return <Delta value={ delta.value } className={ delta.classes.join( ' ' ) } />;
		}

		const deltaValue =
			delta.direction === 'is-undefined-increase'
				? '-'
				: Math.abs( Math.round( delta.percentage_change * 100 ) );

		return (
			<Delta
				value={ `${ deltaValue }%` }
				className={ `${ delta.favorable } ${ delta.direction }` }
			/>
		);
	};

	renderValue = ( value, data ) => {
		const { type } = this.props;
		switch ( type ) {
			case 'currency':
				return formatCurrency( value, data.currency );
			case 'percent':
				return value + '%';
			case 'number':
			default:
				return Math.round( value * 100 ) / 100;
		}
	};

	render() {
		const { data, site, date, attribute, label, requesting } = this.props;

		if ( requesting || ! site.ID || ! data.length ) {
			return (
				<div className="stats-widget__box-contents stats-type-stat">
					<StatsModulePlaceholder isLoading />
				</div>
			);
		}

		const index = findIndex( data, d => d.period === date );
		if ( ! data[ index ] ) {
			return <div className="stats-widget__box-contents stats-type-stat" />;
		}

		const value = data[ index ][ attribute ];
		const timeSeries = data.map( row => +row[ attribute ] );

		return (
			<div className="stats-widget__box-contents stats-type-stat">
				<div className="stats-widget__box-data">
					<span className="stats-widget__box-label">{ label }</span>
					<div className="stats-widget__box-value-and-delta">
						<span className="stats-widget__box-value">
							{ this.renderValue( value, data[ index ] ) }
						</span>
						{ this.renderDelta() }
					</div>
				</div>
				<div className="stats-widget__box-sparkline">
					<Sparkline
						aspectRatio={ 3 }
						data={ timeSeries }
						highlightIndex={ index }
						maxHeight={ 50 }
					/>
				</div>
			</div>
		);
	}
}

export default connect( ( state, { site, query, statType } ) => {
	return {
		requesting: isRequestingSiteStatsForQuery( state, site.ID, statType, query ),
	};
} )( StatsWidgetStat );
