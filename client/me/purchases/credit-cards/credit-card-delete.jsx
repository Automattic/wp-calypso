/**
 * External dependencies
 */
var React = require( 'react' ),
	connect = require( 'react-redux' ).connect;

/**
 * Internal dependencies
 */
var StoredCard = require( 'my-sites/upgrades/checkout/stored-card' ),
	successNotice = require( 'state/notices/actions' ).successNotice,
	errorNotice = require( 'state/notices/actions' ).errorNotice,
	deleteStoredCard = require( 'state/stored-cards/actions' ).deleteStoredCard,
	isDeletingStoredCard = require( 'state/stored-cards/selectors' ).isDeletingStoredCard;

const CreditCardDelete = React.createClass( {
	handleClick: function() {
		this.props.deleteStoredCard( this.props.card ).then( () => {
			this.props.successNotice( this.translate( 'Card deleted successfully' ) );
		} ).catch( error => {
			this.props.errorNotice( error.message );
		} )
	},

	renderDeleteButton: function() {
		var text = this.translate( 'Delete' );

		if ( this.props.isDeleting ) {
			text = this.translate( 'Deleting ' );
		}

		return (
			<button
				className="button credit-card-delete__button"
				disabled={ this.props.isDeleting }
				onClick={ this.handleClick }>
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
	}
} );

export default connect(
	state => {
		return {
			isDeleting: isDeletingStoredCard( state )
		};
	},
	{
		deleteStoredCard,
		errorNotice,
		successNotice
	}
)( CreditCardDelete );
