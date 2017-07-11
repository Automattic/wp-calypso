/* eslint-disable wpcalypso/jsx-classname-namespace */

/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';

class ProductList extends Component {
	static propTypes = { paymentButtons: PropTypes.array.isRequired };

	render() {
		const { paymentButtons } = this.props;

		return (
			<div className="editor-simple-payments-modal__list">
				{ paymentButtons.map( ( { ID: id, title, price, currency } ) => (
					<CompactCard key={ id }>
						<div>{ title }</div><div>{ price }&nbsp;{ currency }</div>
					</CompactCard>
				) ) }
			</div>
		);
	}
}

export default localize( ProductList );
