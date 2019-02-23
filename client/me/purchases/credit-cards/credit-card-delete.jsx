/** @format */

/**
 * External dependencies
 */

import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import { deleteStoredCard } from 'state/stored-cards/actions';
import { errorNotice, successNotice } from 'state/notices/actions';
import { isDeletingStoredCard } from 'state/stored-cards/selectors';
import StoredCard from 'components/credit-card/stored-card';

class CreditCardDelete extends React.Component {
	handleClick = () => {
		this.props
			.deleteStoredCard( this.props.card )
			.then( () => {
				this.props.successNotice( this.props.translate( 'Card deleted successfully' ) );
			} )
			.catch( error => {
				this.props.errorNotice( error.message );
			} );
	};

	renderDeleteButton = () => {
		const text = this.props.isDeleting
			? this.props.translate( 'Deleting' )
			: this.props.translate( 'Delete' );

		return (
			<button
				className="button credit-card-delete__button"
				disabled={ this.props.isDeleting }
				onClick={ this.handleClick }
			>
				{ text }
			</button>
		);
	};

	render() {
		const { card } = this.props;
		return (
			<div className="credit-cards__credit-card-delete" key={ card.stored_details_id }>
				<StoredCard
					lastDigits={ card.card }
					cardType={ card.card_type }
					name={ card.name }
					expiry={ card.expiry }
				/>

				{ this.renderDeleteButton() }
			</div>
		);
	}
}

export default connect(
	( state, props ) => {
		return {
			isDeleting: isDeletingStoredCard( state, props.card.stored_details_id ),
		};
	},
	{
		deleteStoredCard,
		errorNotice,
		successNotice,
	}
)( localize( CreditCardDelete ) );
