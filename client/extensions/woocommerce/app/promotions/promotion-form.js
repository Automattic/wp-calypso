/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import PromotionFormTypeCard from './promotion-form-type-card';
import PromotionFormCouponCard from './promotion-form-coupon-card';

function renderPlaceholder() {
	const { className } = this.props;
	return (
		<div className={ classNames( 'promotions__form', 'is-placeholder', className ) }>
			<div></div>
			<div></div>
			<div></div>
		</div>
	);
}

function renderEditCard( siteId, currency, promotion, editPromotion ) {
	if ( ! promotion ) {
		return null;
	}

	switch ( promotion.type ) {
		case 'coupon':
			return (
				<PromotionFormCouponCard
					siteId={ siteId }
					promotion={ promotion }
					editPromotion={ editPromotion }
				/>
			);
		case 'product_sale':
			// TODO: implement product sale UI.
			return null;
		default:
			return null;
	}
}

export default class PromotionForm extends React.PureComponent {
	static propTypes = {
		className: PropTypes.string,
		siteId: PropTypes.number,
		currency: PropTypes.string,
		promotion: PropTypes.shape( {
			id: PropTypes.isRequired,
		} ),
		editPromotion: PropTypes.func.isRequired,
	};

	render() {
		const { siteId, currency, promotion, editPromotion } = this.props;

		if ( ! siteId ) {
			return renderPlaceholder();
		}

		return (
			<div className={ classNames( 'promotions__form', this.props.className ) }>
				<PromotionFormTypeCard
					siteId={ siteId }
					promotion={ promotion }
					editPromotion={ editPromotion }
				/>

				{ renderEditCard( siteId, currency, promotion, editPromotion ) }
			</div>
		);
	}
}

