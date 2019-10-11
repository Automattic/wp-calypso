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
import ProductOption from './product-option';

class PlansSingleProduct extends Component {
	static propTypes = {
		billingTimeFrame: PropTypes.string,
		currencyCode: PropTypes.string,
		discountedPrice: PropTypes.number,
		fullPrice: PropTypes.number,
		isPlaceholder: PropTypes.bool,
		moreInfoLabel: PropTypes.string,
		onSelect: PropTypes.func,
		options: PropTypes.array,
		optionsHeading: PropTypes.string,
		productDescription: PropTypes.string,
		slug: PropTypes.string,
		title: PropTypes.string,
	};

	static defaultProps = {
		isPlaceholder: false,
	};

	renderPriceGroup() {
		const { currencyCode, discountedPrice, fullPrice, isPlaceholder } = this.props;
		const isDiscounted = !! discountedPrice;

		const priceGroupClasses = classNames( 'plans-single-products__price-group', {
			'is-discounted': isDiscounted,
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
		const { billingTimeFrame, isPlaceholder } = this.props;

		const timeFrameClasses = classNames( 'plans-single-products__billing-timeframe', {
			'is-placeholder': isPlaceholder,
		} );

		return <p className={ timeFrameClasses }>{ billingTimeFrame }</p>;
	}

	renderProductDescription() {
		const { moreInfoLabel, isPlaceholder, productDescription } = this.props;

		const productDescriptionClasses = classNames( 'plans-single-products__product-description', {
			'is-placeholder': isPlaceholder,
		} );

		const moreInfo = moreInfoLabel ? <a href="/">{ moreInfoLabel }</a> : null;

		return (
			<p className={ productDescriptionClasses }>
				{ productDescription } { moreInfo }
			</p>
		);
	}

	renderOptions() {
		const { billingTimeFrame, currencyCode, onSelect, options, optionsHeading } = this.props;

		if ( ! options ) {
			return null;
		}

		return (
			<div className="plans-single-products__options">
				{ optionsHeading && (
					<h4 className="plans-single-products__options-heading">{ optionsHeading }</h4>
				) }
				{ options.map( option => (
					<ProductOption
						key={ option.slug }
						billingTimeFrame={ billingTimeFrame }
						currencyCode={ currencyCode }
						onSelect={ onSelect }
						{ ...option }
					/>
				) ) }
			</div>
		);
	}

	render() {
		const { title } = this.props;

		return (
			<div className="plans-single-products__card">
				<div className="plans-single-products__card-header">
					<h3 className="plans-single-products__product-name">{ title }</h3>
					{ this.renderPriceGroup() }
					{ this.renderBillingTimeFrame() }
				</div>
				<div className="plans-single-products__card-content">
					{ this.renderProductDescription() }
					{ this.renderOptions() }
				</div>
			</div>
		);
	}
}

export default PlansSingleProduct;
