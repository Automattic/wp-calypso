/**
 * External dependencies
 */
import { connect } from 'react-redux';
import React from 'react';

/**
 * Internal dependencies
 */
import { deleteStoredCard } from 'state/stored-cards/actions';
import { errorNotice, successNotice } from 'state/notices/actions';
import { isDeletingStoredCard } from 'state/stored-cards/selectors';
import StoredCard from 'my-sites/upgrades/checkout/stored-card';

const CreditCardDelete = React.createClass( {
	handleClick: function() {
		this.props
			.deleteStoredCard( this.props.card )
			.then( () => {
				this.props.successNotice( this.translate( 'Card deleted successfully' ) );
			} )
			.catch( error => {
				this.props.errorNotice( error.message );
			} );
	},

	renderDeleteButton: function() {
		const text = this.props.isDeleting ? this.translate( 'Deleting ' ) : this.translate( 'Delete' );

		return (
			<button
				className="button credit-card-delete__button"
				disabled={ this.props.isDeleting }
				onClick={ this.handleClick }
			>
				{ text }
			</button>
		);
	},

	render: function() {
		return (
			<div className="credit-card-delete" key={ this.props.card.stored_details_id }>
				<StoredCard card={ this.props.card } />

				{ this.renderDeleteButton() }
			</div>
		);
	},
} );

export default connect(
	state => {
		return {
			isDeleting: isDeletingStoredCard( state ),
		};
	},
	{
		deleteStoredCard,
		errorNotice,
		successNotice,
	}
)( CreditCardDelete );
