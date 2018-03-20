/** @format */

/**
 * External dependencies
 */

import React from 'react';
import Badge from '../badge';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { TERM_ANNUALLY, TERM_BIENNIALLY, TERM_MONTHLY } from '../../lib/plans/constants';

export default class TermPickerOption extends React.Component {
	static propTypes = {
		term: PropTypes.string.isRequired,
		savePercent: PropTypes.number.isRequired,
		price: PropTypes.string.isRequired,
		pricePerMonth: PropTypes.string.isRequired,
		checked: PropTypes.bool.isRequired,
		value: PropTypes.any.isRequired,
		onCheck: PropTypes.func.isRequired,
	};

	static defaultProps = {
		checked: false,
		savePercent: 0,
		onCheck: () => null,
	};

	render() {
		const { savePercent, price, pricePerMonth, checked } = this.props;
		const className = classnames( 'term-picker-option', {
			'term-picker-option--active': checked,
		} );
		return (
			<label className={ className }>
				<div className="term-picker-option__radio-wrapper">
					<input
						type="radio"
						className="term-picker-option__radio"
						checked={ checked }
						onChange={ this.handleChange }
					/>
				</div>

				<div className="term-picker-option__content">
					<div className="term-picker-option__header">
						<div className="term-picker-option__term">{ this.getTermText() }</div>
						<div className="term-picker-option__discount">
							{ savePercent ? (
								<Badge type={ checked ? 'success' : 'warning' }>Save { savePercent }%</Badge>
							) : (
								false
							) }
						</div>
					</div>
					<div className="term-picker-option__description">
						<div className="term-picker-option__price">{ price }</div>
						<div className="term-picker-option__side-note">
							{ savePercent ? 'only ' + pricePerMonth + ' / month' : pricePerMonth + ' / month' }
						</div>
					</div>
				</div>
			</label>
		);
	}

	handleChange = e => {
		if ( e.target.checked ) {
			this.props.onCheck( {
				value: this.props.value,
			} );
		}
	};

	getTermText() {
		switch ( this.props.term ) {
			case TERM_BIENNIALLY:
				return '2 years';

			case TERM_ANNUALLY:
				return '1 year';

			case TERM_MONTHLY:
				return 'month';
		}
	}
}
