/**
 * External dependencies
 */
import React, { Component } from 'react';
import { range, random } from 'lodash';
import moment from 'moment';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import FormInputCheckbox from 'calypso/components/forms/form-checkbox';
import FormLabel from 'calypso/components/forms/form-label';
import FormTextInput from 'calypso/components/forms/form-text-input';
import LineChart from 'calypso/components/line-chart';

const NUM_DATA_SERIES = 3;

export default class LineChartExample extends Component {
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
		return range( NUM_DATA_SERIES ).map( ( index ) => ( {
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

	changeDataMin = ( event ) => {
		const newDataMin = event.target.value;

		this.setState( {
			dataMin: newDataMin,
			data: LineChartExample.createData( newDataMin, this.state.dataMax, this.state.seriesLength ),
		} );
	};

	changeDataMax = ( event ) => {
		const newDataMax = event.target.value;

		this.setState( {
			dataMax: newDataMax,
			data: LineChartExample.createData( this.state.dataMin, newDataMax, this.state.seriesLength ),
		} );
	};

	changeSeriesLength = ( event ) => {
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
				<button className="docs__design-toggle button" onClick={ this.toggleDataControls }>
					{ this.state.showDataControls ? 'Hide Data Controls' : 'Show Data Controls' }
				</button>

				<Card>
					<LineChart
						data={ this.state.data }
						fillArea={ this.state.fillArea }
						legendInfo={ this.state.legendInfo }
					/>
				</Card>

				{ this.state.showDataControls && (
					<div>
						<FormLabel>
							Data Min
							<FormTextInput
								type="number"
								value={ this.state.dataMin }
								min="0"
								onChange={ this.changeDataMin }
							/>
						</FormLabel>

						<FormLabel>
							Data Max
							<FormTextInput
								type="number"
								value={ this.state.dataMax }
								min="0"
								onChange={ this.changeDataMax }
							/>
						</FormLabel>

						<FormLabel>
							Series Length
							<FormTextInput
								type="number"
								value={ this.state.seriesLength }
								min="3"
								onChange={ this.changeSeriesLength }
							/>
						</FormLabel>

						<div>
							<FormLabel>
								<FormInputCheckbox
									checked={ this.state.fillArea }
									onChange={ this.toggleFillArea }
								/>
								Fill Area
							</FormLabel>
						</div>
					</div>
				) }
			</div>
		);
	}
}
