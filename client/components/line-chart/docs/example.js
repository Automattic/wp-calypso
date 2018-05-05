/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
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
		return range( NUM_DATA_SERIES ).map( () => {
			return range( seriesLength ).map( e => {
				const date = new Date();
				date.setDate( date.getDate() - ( seriesLength - e ) );
				return {
					date: date.getTime(),
					value: random( dataMin, dataMax ),
				};
			} );
		} );
	}

	state = {
		dataMin: 1,
		dataMax: 50,
		seriesLength: 10,
		showDataControls: false,
		data: LineChartExample.createData( 1, 50, 10 ),
		yAxisMode: 'absolute',
		fillArea: false,
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

	toggleYAxisMode = () => {
		this.setState( {
			yAxisMode: this.state.yAxisMode === 'absolute' ? 'relative' : 'absolute',
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
						yAxisMode={ this.state.yAxisMode }
						fillArea={ this.state.fillArea }
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

						<div>
							<label>
								<input
									type="checkbox"
									checked={ this.state.yAxisMode === 'absolute' }
									onChange={ this.toggleYAxisMode }
								/>

								Absolute Y Axis
							</label>
						</div>
					</div>
				) }
			</div>
		);
	}
}

export default LineChartExample;
