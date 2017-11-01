/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import { renderField } from './fields';
import SectionHeader from 'components/section-header';

const promotionFieldEdit = ( siteId, promotion, editPromotion ) => ( fieldName, newValue ) => {
	const newPromotion = {
		type: promotion.type, // type always gets set because it's not set when selected.
		[ fieldName ]: newValue,
	};
	editPromotion( siteId, promotion, newPromotion );
};

const PromotionFormCard = ( {
	siteId,
	currency,
	promotion,
	cardModel,
	editPromotion,
} ) => {
	const edit = promotionFieldEdit( siteId, promotion, editPromotion );
	const fields = Object.keys( cardModel.fields ).map( ( fieldName ) => {
		const fieldModel = cardModel.fields[ fieldName ];
		return renderField( fieldName, fieldModel, promotion, edit, currency );
	} );

	return (
		<div>
			<SectionHeader label={ cardModel.labelText } />
			<Card className="promotions__promotion-form-card">
				{ fields }
			</Card>
		</div>
	);
};

PromotionFormCard.PropTypes = {
	siteId: PropTypes.number.isRequired,
	currency: PropTypes.string.isRequired,
	promotion: PropTypes.shape( {
		id: PropTypes.isRequired,
		type: PropTypes.string.isRequired,
	} ),
	editPromotion: PropTypes.func.isRequired,
	cardModel: PropTypes.shape( {
		labelText: PropTypes.string.isRequired,
		fields: PropTypes.object.isRequired,
	} ).isRequired,
};

export default PromotionFormCard;

