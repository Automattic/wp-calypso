/**
 * External dependencies
 */

import React from 'react';
import { uniqueId } from 'lodash';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */

import Badge from 'components/badge';
import { TERM_ANNUALLY, TERM_BIENNIALLY, TERM_MONTHLY } from 'lib/plans/constants';

const TYPE_NEW_SALE = 'new-sale';
const TYPE_UPGRADE = 'upgrade';

export class SubscriptionLengthOption extends React.Component {
	static propTypes = {
		type: PropTypes.oneOf( [ TYPE_NEW_SALE, TYPE_UPGRADE ] ),

		term: PropTypes.string.isRequired,
		savePercent: PropTypes.number,
		priceBeforeDiscount: PropTypes.string,
		price: PropTypes.string.isRequired,
		pricePerMonth: PropTypes.string.isRequired,
		checked: PropTypes.bool,
		value: PropTypes.any.isRequired,
		onCheck: PropTypes.func,
		translate: PropTypes.func.isRequired,
		shouldShowTax: PropTypes.bool,
	};

	static defaultProps = {
		type: TYPE_NEW_SALE,
		checked: false,
		savePercent: 0,
		onCheck: () => null,
		shouldShowTax: false,
	};

	constructor( props ) {
		super( props );
		this.htmlId = uniqueId( 'subscription-option-' );
	}

	render() {
		const { type, checked } = this.props;
		const className = classnames( 'subscription-length-picker__option', {
			'is-active': checked,
		} );
		return (
			<label className={ className } htmlFor={ this.htmlId }>
				<div className="subscription-length-picker__option-radio-wrapper">
					<input
						id={ this.htmlId }
						type="radio"
						className="subscription-length-picker__option-radio"
						checked={ checked }
						onChange={ this.handleChange }
					/>
				</div>

				<div className="subscription-length-picker__option-content">
					{ type === TYPE_NEW_SALE ? this.renderNewSaleContent() : this.renderUpgradeContent() }
				</div>
			</label>
		);
	}

	renderNewSaleContent() {
		const { checked, price, savePercent, term, translate } = this.props;

		return (
			<React.Fragment>
				<div className="subscription-length-picker__option-header">
					<div className="subscription-length-picker__option-term">{ this.getTermText() }</div>
					<div className="subscription-length-picker__option-discount">
						{ savePercent ? (
							<Badge type={ checked ? 'success' : 'warning' }>
								{ translate( 'Save %(percent)s%%', {
									args: {
										percent: savePercent,
									},
								} ) }
							</Badge>
						) : (
							false
						) }
					</div>
				</div>
				<div className="subscription-length-picker__option-description">
					<div className="subscription-length-picker__option-price">{ price }</div>
					{ this.renderPlusTax() }
					<div className="subscription-length-picker__option-side-note">
						{ term !== TERM_MONTHLY ? this.renderPricePerMonth() : false }
					</div>
				</div>
			</React.Fragment>
		);
	}

	renderUpgradeContent() {
		const { price, priceBeforeDiscount, translate } = this.props;
		const hasDiscount = priceBeforeDiscount && priceBeforeDiscount !== price;
		return (
			<React.Fragment>
				<div className="subscription-length-picker__option-header">
					<div className="subscription-length-picker__option-term">{ this.getTermText() }</div>
				</div>
				<div className="subscription-length-picker__option-description">
					{ hasDiscount && (
						<div className="subscription-length-picker__option-old-price">
							{ priceBeforeDiscount }
						</div>
					) }
					<div className="subscription-length-picker__option-price">
						{ price }
						{ this.renderPlusTax() }
					</div>
					{ hasDiscount && (
						<div className="subscription-length-picker__option-credit-info">
							{ translate( 'Credit applied' ) }
						</div>
					) }
				</div>
			</React.Fragment>
		);
	}

	getTermText() {
		const { term, translate } = this.props;
		switch ( term ) {
			case TERM_BIENNIALLY:
				return translate( '%s year', '%s years', {
					count: 2,
					args: '2',
					context: 'subscription length',
				} );

			case TERM_ANNUALLY:
				return translate( '%s year', '%s years', {
					count: 1,
					args: '1',
					context: 'subscription length',
				} );

			case TERM_MONTHLY:
				return translate( '%s month', '%s months', {
					count: 1,
					args: '1',
					context: 'subscription length',
				} );
		}
	}

	renderPricePerMonth() {
		const { savePercent, pricePerMonth, translate } = this.props;

		const args = { args: { price: pricePerMonth } };
		return savePercent
			? translate( 'only %(price)s / month', args )
			: translate( '%(price)s / month', args );
	}

	renderPlusTax() {
		const { shouldShowTax, translate } = this.props;

		if ( ! shouldShowTax ) {
			return null;
		}

		return (
			<sup className="subscription-length-picker__option-tax">
				{ translate( '+tax', {
					comment:
						'This string is displayed immediately next to a localized price with a currency symbol, and is indicating that there may be an additional charge on top of the displayed price.',
				} ) }
			</sup>
		);
	}

	handleChange = ( e ) => {
		if ( e.target.checked ) {
			this.props.onCheck( {
				value: this.props.value,
			} );
		}
	};
}

export default localize( SubscriptionLengthOption );
