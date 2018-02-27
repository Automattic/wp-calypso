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
			this.props.onSelect && this.props.onSelect( event );
		}
	};

	render() {
		const { card, selected, onSelect, className, children } = this.props;
		const classes = classNames( 'credit-card', className, { selected, selectable: onSelect } );
		const content = card ? <StoredCard card={ card } /> : children;
		const role = onSelect ? 'radio' : 'listitem';

		return (
			<div
				className={ classes }
				role={ role }
				onClick={ onSelect }
				onKeyPress={ this.handleKeyPress }
			>
				{ content }
			</div>
		);
	}
}

export default CreditCard;
