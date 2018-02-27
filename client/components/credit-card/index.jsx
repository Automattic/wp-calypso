/** @format */

/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import StoredCard, { cardType } from './stored-card';

class CreditCard extends React.Component {
	static propTypes = {
		card: cardType,
		selected: PropTypes.bool,
		onSelect: PropTypes.func,
		className: PropTypes.string,
	};

	handleKeyPress = event => {
		if ( event.key === 'Enter' || event.key === ' ' ) {
			this.props.onSelect( event );
		}
	};

	render() {
		const { card, selected, onSelect, className, children } = this.props;
		const classes = classNames( 'credit-card', className, { selected, selectable: onSelect } );

		return onSelect ? (
			<div
				className={ classes }
				tabIndex={ -1 }
				role="radio"
				aria-checked={ selected }
				onClick={ onSelect }
				onKeyPress={ this.handleKeyPress }
			>
				{ card ? <StoredCard card={ card } /> : children }
			</div>
		) : (
			<div className={ classes }>{ card ? <StoredCard card={ card } /> : children }</div>
		);
	}
}

export default CreditCard;
