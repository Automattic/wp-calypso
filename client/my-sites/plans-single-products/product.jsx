/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import PlanPrice from 'my-sites/plan-price';
import { getCurrentUserCurrencyCode } from 'state/current-user/selectors';

class PlansSingleProduct extends Component {
	static propTypes = {
		billingTimeFrame: PropTypes.string,
		currencyCode: PropTypes.string,
		discountedPrice: PropTypes.number,
		fullPrice: PropTypes.number,
		isPlaceholder: PropTypes.bool,
		moreInfoLabel: PropTypes.string,
		productDescription: PropTypes.string,
		title: PropTypes.string,
	};

	static defaultProps = {
		isPlaceholder: false,
	};

	renderPriceGroup() {
		const { currencyCode, discountedPrice, fullPrice, isPlaceholder } = this.props;

		const priceGroupClasses = classNames( 'plans-single-products__price-group', {
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
				</div>
			</div>
		);
	}
}

export default connect( ( state, { productSlug } ) => {
	const productProperties = {
		'jetpack-scan': {
			discountedPrice: 10,
			fullPrice: 16,
			moreInfoLabel: 'More info',
			productDescription:
				'Automatic scanning and one-click fixes keep your site one step ahead of security threats.',
			title: 'Jetpack Scan',
		},
		'jetpack-backup': {
			discountedPrice: 16,
			fullPrice: 25,
			moreInfoLabel: 'Which one do I need?',
			productDescription:
				'Always-on backups ensure you never lose your site. Choose from real-time or daily backups.',
			title: 'Jetpack Backup',
		},
	};

	return {
		billingTimeFrame: 'per year',
		currencyCode: getCurrentUserCurrencyCode( state ),
		isPlaceholder: false,
		...productProperties[ productSlug ],
	};
} )( localize( PlansSingleProduct ) );
