import React, { PropTypes } from 'react';

import ComparisonHeader from 'components/comparison-table/comparison-header';
import ComparisonCell from 'components/comparison-table/comparison-cell';

export default React.createClass( {
	displayName: 'ComparisonColumn',

	propTypes: {
		featuresList: PropTypes.object,
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
		return (
			<div>
				{ React.Children.map( this.props.featuresList, this.renderComparisonCell ) }
			</div>
		);
	},

	renderComparisonCell( data ) {
		const component = ComparisonCell;
		const description = data.description;
		return React.createElement( component, {
			content: description
		 } )
	},

	render() {
		return (
			<div className="comparison-column__wrapper">
				<ComparisonHeader
					price={ this.props.price }
					name={ this.props.name }
					description={ this.props.description }
					currentPlan={ this.props.currentPlan }
					popular={ this.props.popular} >
					{ this.props.descriptionColumn
					 	? ( this.props.children )
					 	: null
					}
				</ComparisonHeader>

				{ this.renderComparisonCells() }

			</div>
		)
	}
} );
