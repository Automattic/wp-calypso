/**
 * External dependencies
 */
var React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:me:credit-card-delete' ),
	bindActionCreators = require( 'redux' ).bindActionCreators,
	connect = require( 'react-redux' ).connect;

/**
 * Internal dependencies
 */
var StoredCard = require( 'my-sites/upgrades/checkout/stored-card' ),
	wpcom = require( 'lib/wp' ),
	successNotice = require( 'state/notices/actions' ).successNotice,
	errorNotice = require( 'state/notices/actions' ).errorNotice;

export const CreditCardDelete = React.createClass( {

	displayName: 'CreditCardDelete',

	getInitialState: function() {
		return {
			deleting: false
		};
	},

	handleClick: function() {
		this.setState( {
			deleting: true
		} );
		wpcom.undocumented().me().storedCardDelete( this.props.card, this.handleDeleteCard );
	},

	handleDeleteCard: function( error, response ) {
		if ( error && error.error ) {
			debug( error.error, error.message );
			this.props.errorNotice( error.message );
			this.setState( {
				deleting: false
			} );
		}

		if ( response ) {
			debug( 'Card deleted sucessfully' );
			this.props.successNotice( this.translate( 'Card deleted successfully' ) );

			// Update the list of cards
			this.props.cards.fetch();
		}
	},

	deleteButton: function() {
		var disabled = false,
			text = this.translate( 'Delete' );

		if ( this.state.deleting ) {
			disabled = true;
			text = this.translate( 'Deleting ' );
		}

		return (
			<button className="button credit-card-delete__button" disabled={ disabled } onClick={ this.handleClick }>{ text }</button>
		);
	},

	render: function() {
		return (
			<div className="credit-card-delete" key={ this.props.card.stored_details_id }>
				<StoredCard card={ this.props.card } />
				{ this.deleteButton() }
			</div>
		);
	}
} );

export default connect(
	null,
	dispatch => bindActionCreators( { successNotice, errorNotice }, dispatch )
)( CreditCardDelete );
