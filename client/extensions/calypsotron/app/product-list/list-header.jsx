/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */

export default class ListHeader extends React.Component {
	static propTypes = {
		selectedColumns: PropTypes.array.isRequired,
	}

	constructor( props ) {
		super( props );

		this.renderTitle = this.renderTitle.bind( this );
	}

	render() {
		const { selectedColumns } = this.props;

		const liClasses = classNames(
			'product-list__list-row',
			'product-list__list-row-header'
		);

		return (
			<li className={ liClasses }>
				{ selectedColumns.map( this.renderTitle ) }
			</li>
		);
	}

	renderTitle( col ) {
		const spanClasses = classNames(
			'product-list__list-cell',
			'product-list__list-cell-' + col.key
		);
		const title = ( 'function' === typeof col.title ? col.title( this.props ) : col.title );

		return <span className={ spanClasses } key={ col.key }>{ title }</span>;
	}
}
