/** @format */

/**
 * External dependencies
 */

import React from 'react';
import Badge from '../badge';
import PropTypes from 'prop-types';
import classnames from 'classnames';

export default class TermPickerOption extends React.Component {
	static propTypes = {
		term: PropTypes.string.isRequired,
		savePercent: PropTypes.number.isRequired,
		price: PropTypes.string.isRequired,
		pricePerMonth: PropTypes.string.isRequired,
		isActive: PropTypes.bool.isRequired,
		onChange: PropTypes.func.isRequired,
	};

	static defaultProps = {
		isActive: false,
		onChange: () => null,
	};

	render() {
		const { term, savePercent, price, pricePerMonth, isActive, onChange } = this.props;
		const className = classnames( 'term-picker-option', {
			'term-picker-option--active': isActive,
		} );
		return (
			<label className={ className }>
				<div className="term-picker-option__radio-wrapper">
					<input
						type="radio"
						className="term-picker-option__radio"
						checked={ isActive }
						onChange={ onChange }
					/>
				</div>

				<div className="term-picker-option__content">
					<div className="term-picker-option__header">
						<div className="term-picker-option__term">{ term }</div>
						<div className="term-picker-option__discount">
							{ savePercent ? (
								<Badge type={ isActive ? 'success' : 'warning' }>Save { savePercent }%</Badge>
							) : (
								false
							) }
						</div>
					</div>
					<div className="term-picker-option__description">
						<div className="term-picker-option__price">{ price }</div>
						<div className="term-picker-option__side-note">{ pricePerMonth }</div>
					</div>
				</div>
			</label>
		);
	}
}
