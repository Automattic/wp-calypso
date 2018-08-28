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
import StoredCard from './stored-card';

class CreditCard extends React.Component {
	static propTypes = {
		card: PropTypes.shape( StoredCard.propTypes ),
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
		const classes = classNames( 'credit-card', className, {
			'is-selected': selected,
			'is-selectable': onSelect,
		} );

		const selectionProps = onSelect && {
			tabIndex: -1,
			role: 'radio',
			'aria-checked': selected,
			onClick: onSelect,
			onKeyPress: this.handleKeyPress,
		};

		return (
			<div className={ classes } { ...selectionProps }>
				{ card ? <StoredCard { ...card } /> : children }
			</div>
		);
	}
}

export default CreditCard;
