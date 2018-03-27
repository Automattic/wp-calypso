/** @format */

/**
 * External dependencies
 */

import React from 'react';
import Badge from 'components/badge';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import { TERM_ANNUALLY, TERM_BIENNIALLY, TERM_MONTHLY } from '../../lib/plans/constants';

let componentNumber = 0;

export class SubscriptionLengthOption extends React.Component {
	static propTypes = {
		term: PropTypes.string.isRequired,
		savePercent: PropTypes.number.isRequired,
		price: PropTypes.string.isRequired,
		pricePerMonth: PropTypes.string.isRequired,
		checked: PropTypes.bool.isRequired,
		value: PropTypes.any.isRequired,
		onCheck: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	static defaultProps = {
		checked: false,
		savePercent: 0,
		onCheck: () => null,
	};

	constructor( props ) {
		super( props );
		this.htmlId = 'subscription-option-' + ++componentNumber;
	}

	render() {
		const { savePercent, price, term, checked } = this.props;
		const className = classnames( 'subscription-length-option', {
			'subscription-length-option--active': checked,
		} );
		return (
			<label className={ className } htmlFor={ this.htmlId }>
				<div className="subscription-length-option__radio-wrapper">
					<input
						id={ this.htmlId }
						type="radio"
						className="subscription-length-option__radio"
						checked={ checked }
						onChange={ this.handleChange }
					/>
				</div>

				<div className="subscription-length-option__content">
					<div className="subscription-length-option__header">
						<div className="subscription-length-option__term">{ this.getTermText() }</div>
						<div className="subscription-length-option__discount">
							{ savePercent ? this.renderSaveBadge() : false }
						</div>
					</div>
					<div className="subscription-length-option__description">
						<div className="subscription-length-option__price">{ price }</div>
						<div className="subscription-length-option__side-note">
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

	renderSaveBadge() {
		const { savePercent, checked, translate } = this.props;
		return (
			<Badge type={ checked ? 'success' : 'warning' }>
				{ translate( 'Save %(percent)s%%', {
					args: {
						percent: savePercent,
					},
				} ) }
			</Badge>
		);
	}

	renderPricePerMonth() {
		const { savePercent, pricePerMonth, translate } = this.props;

		let retval;
		if ( savePercent ) {
			retval = translate( 'only %(price)s / month', { args: { price: pricePerMonth } } );
		} else {
			retval = translate( '%(price)s / month', { args: { price: pricePerMonth } } );
		}
		return retval;
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
