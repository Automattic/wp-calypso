/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import PlanPrice from 'my-sites/plan-price';

class PlansSingleProductOption extends Component {
	static propTypes = {
		billingTimeFrame: PropTypes.string,
		currencyCode: PropTypes.string,
		discountedPrice: PropTypes.number,
		fullPrice: PropTypes.number,
		isPlaceholder: PropTypes.bool,
		onSelect: PropTypes.func,
		slug: PropTypes.string,
		title: PropTypes.string,
	};

	static defaultProps = {
		isPlaceholder: false,
	};

	renderPriceGroup() {
		const { currencyCode, discountedPrice, fullPrice, isPlaceholder } = this.props;

		const priceGroupClasses = classNames( 'plans-single-products__option-price-group', {
			'is-placeholder': isPlaceholder,
		} );

		return (
			<div className={ priceGroupClasses }>
				<PlanPrice currencyCode={ currencyCode } rawPrice={ fullPrice } original />
				<PlanPrice currencyCode={ currencyCode } rawPrice={ discountedPrice } discounted />
			</div>
		);
	}

	renderBillingTimeFrame() {
		const { billingTimeFrame, discountedPrice, isPlaceholder } = this.props;
		const isDiscounted = !! discountedPrice;

		const timeFrameClasses = classNames( 'plans-single-products__option-billing-timeframe', {
			'is-discounted': isDiscounted,
			'is-placeholder': isPlaceholder,
		} );

		return <p className={ timeFrameClasses }>{ billingTimeFrame }</p>;
	}

	handleSelect() {
		const { onSelect, slug } = this.props;
		onSelect( slug );
	}

	render() {
		const { title } = this.props;

		return (
			<div className="plans-single-products__option">
				<div className="plans-single-products__option-name">{ title }</div>
				{ this.renderPriceGroup() }
				{ this.renderBillingTimeFrame() }
			</div>
		);
	}
}

export default PlansSingleProductOption;
