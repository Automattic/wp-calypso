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
import { Button } from '@automattic/components';
import StoredCard from 'components/credit-card/stored-card';

/**
 * Style dependencies
 */
import './credit-card-delete.scss';

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

	renderDeleteButton() {
		const { isDeleting, translate } = this.props;
		const text = isDeleting ? translate( 'Deleting…' ) : translate( 'Delete' );

		return (
			<Button
				className="credit-cards__delete-button"
				disabled={ isDeleting }
				onClick={ this.handleClick }
			>
				{ text }
			</Button>
		);
	}

	render() {
		const { card } = this.props;
		return (
			<div className="credit-cards__credit-card-delete">
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
	( state, props ) => ( {
		isDeleting: isDeletingStoredCard( state, props.card.stored_details_id ),
	} ),
	{
		deleteStoredCard,
		errorNotice,
		successNotice,
	}
)( localize( CreditCardDelete ) );
