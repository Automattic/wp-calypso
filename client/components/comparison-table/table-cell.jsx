import React, { PropTypes } from 'react';

import Gridicon from 'components/gridicon';

export default React.createClass( {
	displayName: 'ComparisonTableCell',

	renderFeatureContent() {
		if( ! this.props.descriptionColumn ) {
			let content = this.props.feature[ this.props.id ];
			console.log( typeof content );
			if( typeof content === 'boolean' && content === true ) {
				return ( <Gridicon icon="checkmark" /> )
			}
			if( typeof content === 'boolean' && content === false ) {
				return ( ' ' );
			}

			return content;
		}

		return this.props.feature.description;
	},

	render() {

		return (
			<div className="comparison-table__cell">{ this.renderFeatureContent() }</div>
		);
	}
} );
