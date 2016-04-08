import React, { PropTypes } from 'react';

import Gridicon from 'components/gridicon';

export default React.createClass( {
	displayName: 'ComparisonTableCell',

	renderFeatureContent() {
		if( ! this.props.descriptionColumn ) {
			let content = this.props.feature[ this.props.id ];
			console.log( typeof content );
			if( typeof content === 'boolean' && content === true ) {
				return ( <Gridicon icon="checkmark" size={ 18 } /> )
			}
			if( typeof content === 'boolean' && content === false || this.props.feature.header ) {
				return ( <span>&nbsp;</span> );
			}

			return content;
		}

		return ( <span>{ this.props.feature.description }</span> );
	},

	render() {

		return (
			<div className="comparison-table__cell">{ this.renderFeatureContent() }</div>
		);
	}
} );
