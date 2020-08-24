/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import PieChart from 'components/pie-chart';
import PieChartLegend from 'components/pie-chart/legend';

class PieChartExample extends Component {
	static displayName = 'PieChart';

	state = {
		direct: {
			value: 189,
			show: true,
			name: 'Direct',
			description: 'Customers who find your listing searching for your business or address',
		},
		discovery: {
			value: 362,
			show: true,
			name: 'Discovery',
			description: 'Customers who find your listing searching for a category, product, or service',
		},
		referral: {
			value: 122,
			show: true,
			name: 'Referral',
			description: 'Customers who find your listing by being referred from another type of search',
		},
		showDataControls: false,
	};

	titleFunc = ( translate, dataTotal ) => {
		return translate( '%(dataTotal)d Total Searches', {
			args: {
				dataTotal,
			},
		} );
	};

	changeShow = ( event ) => {
		this.setState( {
			[ event.target.name ]: {
				name: this.state[ event.target.name ].name,
				value: parseInt( this.state[ event.target.name ].value, 10 ),
				description: this.state[ event.target.name ].description,
				show: event.target.checked,
			},
		} );
	};

	changeValue = ( event ) => {
		this.setState( {
			[ event.target.name ]: {
				name: this.state[ event.target.name ].name,
				value: parseInt( event.target.value, 10 ),
				description: this.state[ event.target.name ].description,
				show: this.state[ event.target.name ].show,
			},
		} );
	};

	changeShowDataControls = () => {
		this.setState( {
			showDataControls: ! this.state.showDataControls,
		} );
	};

	render() {
		const data = [];

		for ( const seriesName of [ 'direct', 'discovery', 'referral' ] ) {
			if ( this.state[ seriesName ].show ) {
				data.push( {
					value: this.state[ seriesName ].value || 0,
					name: this.state[ seriesName ].name,
					description: this.state[ seriesName ].description,
				} );
			}
		}

		return (
			<div>
				<a className="docs__design-toggle button" onClick={ this.changeShowDataControls }>
					{ this.state.showDataControls ? 'Hide Data Controls' : 'Show Data Controls' }
				</a>

				<Card>
					<PieChart data={ data } title={ this.titleFunc } />
					<PieChartLegend data={ data } />
				</Card>

				{ this.state.showDataControls && (
					<Card>
						{ [ 'direct', 'discovery', 'referral' ].map( ( seriesName ) => {
							return (
								<div key={ seriesName }>
									<h2>{ this.state[ seriesName ].name }</h2>
									<input
										name={ seriesName }
										type="number"
										value={ this.state[ seriesName ].value }
										onChange={ this.changeValue }
									/>
									<label>{ 'Show' }</label>{ ' ' }
									<input
										name={ seriesName }
										type="checkbox"
										checked={ this.state[ seriesName ].show }
										onChange={ this.changeShow }
									/>
								</div>
							);
						} ) }
					</Card>
				) }
			</div>
		);
	}
}

export default PieChartExample;
