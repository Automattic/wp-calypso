/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */

export default class ListRow extends React.Component {
	static propTypes = {
		selectedColumns: PropTypes.array.isRequired,
		data: PropTypes.object.isRequired,
		editable: PropTypes.bool.isRequired,
		disabled: PropTypes.bool.isRequired,
		onEdit: PropTypes.func.isRequired,
		renderHelpers: PropTypes.object.isRequired,
	}

	constructor( props ) {
		super( props );

		this.renderField = this.renderField.bind( this );
		this.renderFieldContents = this.renderFieldContents.bind( this );
	}

	render() {
		const { selectedColumns } = this.props;

		return (
			<li className="product-list__list-row">
				{ selectedColumns.map( this.renderField ) }
			</li>
		);
	}

	renderField( col ) {
		const spanClasses = classNames(
			'product-list__list-cell',
			'product-list__list-cell-' + col.key
		);

		return (
			<span className={ spanClasses } key={ col.key }>
				{ this.renderFieldContents( col ) }
			</span>
		);
	}

	renderFieldContents( col ) {
		const { data, editable, disabled, onEdit, renderHelpers } = this.props;

		if ( editable && col.renderEdit ) {
			return col.renderEdit( data, col.key, col.constraints, renderHelpers, disabled, onEdit );
		} else if ( col.renderView ) {
			return col.renderView( data, col.key, col.constraints, renderHelpers );
		}

		return null;
	}
}

