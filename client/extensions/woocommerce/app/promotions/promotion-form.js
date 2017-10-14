/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { uniqueId } from 'lodash';

/**
 * Internal dependencies
 */
import PromotionFormCard from './promotion-form-card';
import PromotionFormTypeHeader from './promotion-form-type-header';

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

	render() {
		const { siteId, currency, editPromotion } = this.props;

		if ( ! siteId ) {
			return renderPlaceholder();
		}

		const promotion = this.props.promotion ||
			{ id: { placeholder: uniqueId( 'promotion_' ) }, type: 'percent' };

		return (
			<div className={ classNames( 'promotions__form', this.props.className ) }>
				<PromotionFormTypeHeader { ...{ siteId, promotion, editPromotion } } />

				<PromotionFormCard { ...{
					siteId,
					currency,
					promotion,
					editPromotion,
				} } />
			</div>
		);
	}
}

