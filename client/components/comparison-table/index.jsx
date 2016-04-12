import React, { PropTypes } from 'react';

import Card from 'components/card';
import TableColumn from './table-column';

export default React.createClass( {
	displayName: 'ComparisonTable',

	propTypes: {
		descriptionColumn: PropTypes.bool,
		featuresList: PropTypes.array,
		columns: PropTypes.number,
		showHeader: PropTypes.bool
	},

	getDefaultProps() {
		return {
			featuresList: null,
			columns: 1,
			descriptionColumn: true,
			showHeader: true
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
