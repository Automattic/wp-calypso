import React, { PropTypes } from 'react';

export default class ListHeader extends React.Component {
	propTypes: {
		selectedColumns: PropTypes.array.isRequired,
	}

	constructor( props ) {
		super( props );

		this.renderTitle = this.renderTitle.bind( this );
	}

	render() {
		const { selectedColumns } = this.props;

		return (
			<li className="product-list__list-row product-list__list-row-header">
				{ selectedColumns.map( this.renderTitle ) }
			</li>
		);
	}

	renderTitle( col ) {
		const classes = 'product-list__list-cell product-list__list-cell-' + col.key;
		const title = ( 'function' === typeof col.title ? col.title( this.props ) : col.title );

		return <span className={ classes } key={ col.key }>{ title }</span>;
	}
}
