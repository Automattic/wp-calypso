/** @format */

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

export class SubscriptionLengthOption extends React.Component {
	static propTypes = {
		term: PropTypes.string.isRequired,
		savePercent: PropTypes.number,
		price: PropTypes.string.isRequired,
		pricePerMonth: PropTypes.string.isRequired,
		checked: PropTypes.bool,
		value: PropTypes.any.isRequired,
		onCheck: PropTypes.func,
		translate: PropTypes.func.isRequired,
	};

	static defaultProps = {
		checked: false,
		savePercent: 0,
		onCheck: () => null,
	};

	constructor( props ) {
		super( props );
		this.htmlId = uniqueId( 'subscription-option-' );
	}

	render() {
		const { checked, price, savePercent, term, translate } = this.props;
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
						<div className="subscription-length-picker__option-side-note">
							{ term !== TERM_MONTHLY ? this.renderPricePerMonth() : false }
						</div>
					</div>
				</div>
			</label>
		);
	}

	getTermText() {
		const { term, translate } = this.props;
		switch ( term ) {
			case TERM_BIENNIALLY:
				return translate( '%s year', '%s years', { count: 2, args: '2' } );

			case TERM_ANNUALLY:
				return translate( '%s year', '%s years', { count: 1, args: '1' } );

			case TERM_MONTHLY:
				return translate( '%s month', '%s months', { count: 1, args: '1' } );
		}
	}

	renderPricePerMonth() {
		const { savePercent, pricePerMonth, translate } = this.props;

		const args = { args: { price: pricePerMonth } };
		return savePercent
			? translate( 'only %(price)s / month', args )
			: translate( '%(price)s / month', args );
	}

	handleChange = e => {
		if ( e.target.checked ) {
			this.props.onCheck( {
				value: this.props.value,
			} );
		}
	};
}

export default localize( SubscriptionLengthOption );
