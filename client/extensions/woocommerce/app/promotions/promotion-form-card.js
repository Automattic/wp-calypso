/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import SectionHeader from 'components/section-header';

function renderField( fieldName, fieldComponent, promotion, edit, currency ) {
	const props = {
		key: fieldName,
		value: promotion[ fieldName ],
		promotion,
		fieldName,
		edit,
		currency,
	};
	return React.cloneElement( fieldComponent, props );
}

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
		const fieldComponent = cardModel.fields[ fieldName ];
		return renderField( fieldName, fieldComponent, promotion, edit, currency );
	} );

	const classes = classNames(
		'promotions__promotion-form-card',
		{ [ cardModel.cssClass ]: cardModel.cssClass }
	);

	return (
		<div>
			<SectionHeader label={ cardModel.labelText } />
			<Card className={ classes }>
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

