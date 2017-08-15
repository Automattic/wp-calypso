/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import FoldableCard from 'components/foldable-card';

class OrderNotesByDay extends Component {
	static propTypes = {
		count: PropTypes.number,
		date: PropTypes.string,
		index: PropTypes.number,
		isOpen: PropTypes.bool,
		onClick: PropTypes.func,
	}

	onClick = () => {
		this.props.onClick( this.props.index );
	}

	render() {
		const { count, date, isOpen, moment, translate } = this.props;
		const displayDate = moment( date, 'YYYYMMDD' ).format( 'L' );

		const header = (
			<div>
				<h3>{ displayDate }</h3>
				<small>{ translate( '%(count)s events', { args: { count } } ) }</small>
			</div>
		);

		return (
			<div className="order-notes__day">
				<FoldableCard
					onClick={ this.onClick }
					className="order-notes__day-header"
					expanded={ isOpen }
					header={ header }
					screenReaderText={ translate( 'Show notes from %(date)s', { args: { date: displayDate } } ) }>
					{ this.props.children }
				</FoldableCard>
			</div>
		);
	}
}

export default localize( OrderNotesByDay );
