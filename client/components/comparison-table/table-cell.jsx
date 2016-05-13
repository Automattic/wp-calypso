import React, { PropTypes } from 'react';

import Gridicon from 'components/gridicon';
import classNames from 'classnames';

export default React.createClass( {
	displayName: 'ComparisonTableCell',

	renderFeatureContent() {
		if( ! this.props.descriptionColumn ) {
			let content = this.props.feature[ this.props.id ];

			if( typeof content === 'boolean' && content === true ) {
				return ( <Gridicon icon="checkmark" size={ 18 } /> )
			}
			if( typeof content === 'boolean' && content === false || this.props.feature.header ) {
				return ( <span>&nbsp;</span> );
			}

			return ( <span> { content }</span> );
		}

		return ( <span>{ this.props.feature.description }</span> );
	},

	render() {
		const isHeader = this.props.feature.header;
		const classes = classNames( {
			'comparison-table__cell': true,
			'is-header': isHeader
			} );

		return (
			<div className={ classes }>{ this.renderFeatureContent() }</div>
		);
	}
} );
