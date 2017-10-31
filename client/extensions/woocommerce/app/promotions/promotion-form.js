/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { uniqueId } from 'lodash';
import warn from 'lib/warn';

/**
 * Internal dependencies
 */
import PromotionFormCard from './promotion-form-card';
import PromotionFormTypeCard from './promotion-form-type-card';
import promotionModels from './promotion-models';

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

	renderFormCards( promotion ) {
		const { siteId, currency, editPromotion } = this.props;
		const model = promotionModels[ promotion.type ];

		if ( ! model ) {
			warn( 'No model found for promotion type: ' + promotion.type );
			return null;
		}

		return Object.keys( model ).map( ( key ) => {
			const cardModel = model[ key ];
			return (
				<PromotionFormCard key={ key } { ...{
					cardModel,
					siteId,
					currency,
					promotion,
					editPromotion,
				} } />
			);
		} );
	}

	render() {
		const { siteId, editPromotion } = this.props;

		if ( ! siteId ) {
			return renderPlaceholder();
		}

		const promotion = this.props.promotion ||
			{ id: { placeholder: uniqueId( 'promotion_' ) }, type: 'percent' };

		return (
			<div className={ classNames( 'promotions__form', this.props.className ) }>
				<PromotionFormTypeCard { ...{ siteId, promotion, editPromotion } } />
				{ this.renderFormCards( promotion ) }
			</div>
		);
	}
}

