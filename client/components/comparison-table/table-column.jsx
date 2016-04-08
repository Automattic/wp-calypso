import React, { PropTypes } from 'react';

import TableHeader from 'components/comparison-table/table-header';
import TableCell from 'components/comparison-table/table-cell';

export default React.createClass( {
	displayName: 'ComparisonTableColumn',

	propTypes: {
		featuresList: PropTypes.array,
		descriptionColumn: PropTypes.bool,
		comparisonID: PropTypes.string,
		name: PropTypes.string,
		description: PropTypes.string,
		price: PropTypes.number,
		currentPlan: PropTypes.bool,
		popular: PropTypes.bool
	},

	getDefaultProps() {
		return {
			featuresList: null,
			descriptionColumn: false,
			comparisonID: '',
			name: '',
			description: '',
			price: null,
			currentPlan: false,
			popular: false
		};
	},

	renderComparisonCells() {
		let cells = [];
		let featureID = this.props.comparisonID;
		this.props.featuresList.forEach( function( feature, i ) {
			cells.push( <TableCell key={ i  + '-' + feature.toString() } id={ featureID } feature={ feature }></TableCell> );
			} );
		return cells;
	},

	render() {
		return (
			<div className="table-column__wrapper">
				<TableHeader
					price={ this.props.price }
					name={ this.props.name }
					description={ this.props.description }
					currentPlan={ this.props.currentPlan }
					popular={ this.props.popular} >
					{ this.props.descriptionColumn
					 	? ( this.props.children )
					 	: null
					}
				</TableHeader>

				{ this.renderComparisonCells() }

			</div>
		)
	}
} );
