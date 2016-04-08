import React, { PropTypes } from 'react';

import Card from 'components/card';
import TableColumn from './table-column';

export default React.createClass( {
	displayName: 'ComparisonTable',

	propTypes: {
		descriptionColumn: PropTypes.bool,
		featuresList: PropTypes.array,
		columns: PropTypes.number
	},

	getDefaultProps() {
		return {
			featuresList: null,
			columns: 1
		};
	},

	render() {
		return (
			<Card className="comparison-table__wrapper">
				{ this.props.children }
			</Card>
		);
	}
} );
