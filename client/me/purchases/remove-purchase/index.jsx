/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import Dialog from 'components/dialog';
import { getPurchase, isDataLoading } from '../utils';
import { getName, isExpiring } from 'lib/purchases';

const RemovePurchase = React.createClass( {
	propTypes: {
		selectedPurchase: React.PropTypes.object.isRequired,
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ).isRequired
	},

	getInitialState() {
		return {
			isDialogVisible: false
		};
	},

	closeDialog() {
		this.setState( { isDialogVisible: false } );
	},

	openDialog( event ) {
		event.preventDefault();

		this.setState( { isDialogVisible: true } );
	},

	removePurchase() {
		// TODO: actually remove the purchase
	},

	renderCard() {
		const productName = getName( getPurchase( this.props ) );

		return (
			<CompactCard href="#" onClick={ this.openDialog }>
				{ this.translate( 'Remove %(productName)s', { args: { productName } } ) }
			</CompactCard>
		);
	},

	renderDialog() {
		const buttons = [ {
				action: 'cancel',
				disabled: false,
				label: this.translate( 'Cancel' )
			},
			{
				action: 'remove',
				disabled: false,
				isPrimary: true,
				label: this.translate( 'Remove Now' ),
				onClick: this.removePurchase
			} ],
			purchase = getPurchase( this.props ),
			productName = getName( purchase );

		return (
			<Dialog
				className="remove-purchase__dialog"
				buttons={ buttons }
				isVisible={ this.state.isDialogVisible }
				onClose={ this.closeDialog }>
				<h1>{ this.translate( 'Remove %(productName)s', { args: { productName } } ) }</h1>
				<p>
					{
						this.translate( 'Are you sure you want to remove %(productName)s from {{em}}%(domain)s{{/em}}?', {
							args: { productName, domain: this.props.selectedSite.slug },
							components: { em: <em /> }
						} )
					}
					{ ' ' }
					{ this.translate( 'By removing it, you will not be able to reuse it again without purchasing a new subscription.' ) }
				</p>
			</Dialog>
		);
	},

	render() {
		if ( isDataLoading( this.props ) ) {
			return null;
		}

		const purchase = getPurchase( this.props );

		if ( ! isExpiring( purchase ) ) {
			return null;
		}

		return (
			<span>
				{ this.renderCard() }
				{ this.renderDialog() }
			</span>
		);
	}
} );

export default RemovePurchase;
