/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import i18n from 'i18n-calypso';
import Gridicon from 'gridicons';

export default class ProductVariationsForm extends Component {

	static propTypes = {
		product: PropTypes.object.isRequired,
		editProduct: PropTypes.func.isRequired,
	};

	renderRow( variation, index ) {
		const label = variation.name;
		return (
			<tr key={ index }>
				<td>{ label }</td>
				<td></td>
				<td></td>
				<td></td>
				<td><Gridicon icon="cog" /></td>
			</tr>
		);
	}

	render() {
		if ( ! this.props.product.variations ) {
			return (
				<div></div>
			);
		}

		const rows = this.props.product.variations.map( this.renderRow, this );
		return (
			<div className="product-variations-form">
				<table className="product-variations-form__table">
					<thead>
						<tr>
							<th></th>
							<th>{ i18n.translate( 'Price' ) }</th>
							<th>{ i18n.translate( 'Delivery method' ) }</th>
							<th>{ i18n.translate( 'Manage Stock' ) }</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{rows}
					</tbody>
				</table>
			</div>
		);
	}

}
