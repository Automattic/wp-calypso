/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { moment } from 'i18n-calypso';
import { range, random } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import LineChart from 'components/line-chart';

const NUM_DATA_SERIES = 3;

class LineChartExample extends Component {
	static displayName = 'LineChart';

	static createData( dataMin, dataMax, seriesLength ) {
		const now = moment();

		return range( NUM_DATA_SERIES ).map( () => {
			let date = now.clone();

			return range( seriesLength )
				.map( () => {
					date = date.subtract( 1, 'days' );

					return {
						date: date.valueOf(),
						value: random( dataMin, dataMax ),
					};
				} )
				.reverse();
		} );
	}

	static createLegendInfo() {
		return range( NUM_DATA_SERIES ).map( index => ( {
			name: `Line #${ index + 1 }`,
		} ) );
	}

	state = {
		data: LineChartExample.createData( 1, 50, 10 ),
		dataMax: 50,
		dataMin: 1,
		fillArea: false,
		legendInfo: LineChartExample.createLegendInfo(),
		seriesLength: 10,
		showDataControls: false,
	};

	changeDataMin = event => {
		const newDataMin = event.target.value;

		this.setState( {
			dataMin: newDataMin,
			data: LineChartExample.createData( newDataMin, this.state.dataMax, this.state.seriesLength ),
		} );
	};

	changeDataMax = event => {
		const newDataMax = event.target.value;

		this.setState( {
			dataMax: newDataMax,
			data: LineChartExample.createData( this.state.dataMin, newDataMax, this.state.seriesLength ),
		} );
	};

	changeSeriesLength = event => {
		const newSeriesLength = event.target.value;

		this.setState( {
			seriesLength: newSeriesLength,
			data: LineChartExample.createData( this.state.dataMin, this.state.dataMax, newSeriesLength ),
		} );
	};

	toggleDataControls = () => {
		this.setState( {
			showDataControls: ! this.state.showDataControls,
		} );
	};

	toggleFillArea = () => {
		this.setState( {
			fillArea: ! this.state.fillArea,
		} );
	};

	render() {
		return (
			<div>
				<a className="docs__design-toggle button" onClick={ this.toggleDataControls }>
					{ this.state.showDataControls ? 'Hide Data Controls' : 'Show Data Controls' }
				</a>

				<Card>
					<LineChart
						data={ this.state.data }
						fillArea={ this.state.fillArea }
						legendInfo={ this.state.legendInfo }
					/>
				</Card>

				{ this.state.showDataControls && (
					<div>
						<label>Data Min</label>
						<input
							type="number"
							value={ this.state.dataMin }
							min="0"
							onChange={ this.changeDataMin }
						/>

						<label>Data Max</label>
						<input
							type="number"
							value={ this.state.dataMax }
							min="0"
							onChange={ this.changeDataMax }
						/>

						<label>Series Length</label>
						<input
							type="number"
							value={ this.state.seriesLength }
							min="3"
							onChange={ this.changeSeriesLength }
						/>

						<div>
							<label>
								<input
									type="checkbox"
									checked={ this.state.fillArea }
									onChange={ this.toggleFillArea }
								/>
								Fill Area
							</label>
						</div>
					</div>
				) }
			</div>
		);
	}
}

export default LineChartExample;
