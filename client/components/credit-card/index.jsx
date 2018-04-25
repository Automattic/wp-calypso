/** @format */

/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import StoredCard from './stored-card';

class CreditCard extends React.Component {
	handleKeyPress = event => {
		if ( event.key === 'Enter' || event.key === ' ' ) {
			this.props.onClick && this.props.onClick( event );
		}
	};

	render() {
		const { card, selected, onClick, className, children } = this.props;
		const classes = classNames( 'credit-card', className, { selected } );
		const content = card ? <StoredCard card={ card } /> : children;
		const role = onClick ? 'radio' : 'listitem';

		return (
			<div
				className={ classes }
				role={ role }
				onClick={ onClick }
				onKeyPress={ this.handleKeyPress }
			>
				{ content }
			</div>
		);
	}
}

export default CreditCard;
