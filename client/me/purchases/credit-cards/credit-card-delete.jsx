/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import StoredCard from 'my-sites/checkout/checkout/stored-card';
import { errorNotice, successNotice } from 'state/notices/actions';
import { deleteStoredCard } from 'state/stored-cards/actions';
import { isDeletingStoredCard } from 'state/stored-cards/selectors';

const CreditCardDelete = React.createClass( {
	handleClick: function() {
		this.props
			.deleteStoredCard( this.props.card )
			.then( () => {
				this.props.successNotice( this.props.translate( 'Card deleted successfully' ) );
			} )
			.catch( error => {
				this.props.errorNotice( error.message );
			} );
	},

	renderDeleteButton: function() {
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
)( localize( CreditCardDelete ) );
