/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import { isNumber } from 'lodash';

/**
 * Internal dependencies
 */
import ProductFormVariationRow from './product-form-variation-row';

class ProductFormVariationsTable extends React.Component {

	static propTypes = {
		variations: PropTypes.array,
		product: PropTypes.object,
		editProductVariation: PropTypes.func.isRequired,
	};

	renderVariationRow( variation ) {
		const { product, variations, editProductVariation } = this.props;
		const id = isNumber( variation.id ) && variation.id || 'index_' + variation.id.index;
		const manageStock = variations && variations[ 0 ].manage_stock || false;

		return (
			<ProductFormVariationRow
				key={ id }
				product={ product }
				variation={ variation }
				manageStock={ manageStock }
				editProductVariation={ editProductVariation }
			/>
		);
	}

	render() {
		const { variations, translate } = this.props;
		return (
			<table className="products__product-form-variation-table">
				<thead>
					<tr>
						<th></th>
						<th></th>
						<th>{ translate( 'Price' ) }</th>
						<th>{ translate( 'Dimensions & weight' ) }</th>
						<th></th>
						<th>{ translate( 'Manage stock' ) }</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{ variations && variations.map( ( variation ) => this.renderVariationRow( variation ) ) }
				</tbody>
			</table>
		);
	}

}

export default localize( ProductFormVariationsTable );
