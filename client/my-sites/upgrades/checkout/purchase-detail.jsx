/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';

const PurchaseDetail = ( { additionalClass, buttonText, description, onButtonClick, title } ) => (
	<li className={ 'checkout__purchase-detail ' + additionalClass }>
		<div className="checkout__purchase-detail-text">
			<h3 className="checkout__purchase-detail-title">{ title }</h3>
			<p className="checkout__purchase-detail-description">{ description }</p>
		</div>
		<Button onClick={ onButtonClick } primary>
			{ buttonText }
		</Button>
	</li>
);

PurchaseDetail.propTypes = {
	additionalClass: React.PropTypes.string,
	buttonText: React.PropTypes.string.isRequired,
	description: React.PropTypes.string.isRequired,
	onButtonClick: React.PropTypes.func.isRequired,
	title: React.PropTypes.string.isRequired
};

export default PurchaseDetail;
