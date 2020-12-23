/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React from 'react';
import page from 'page';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { Button, Card } from '@automattic/components';
import DomainManagementHeader from 'calypso/my-sites/domains/domain-management/components/header';
import Main from 'calypso/components/main';
import SectionHeader from 'calypso/components/section-header';
import FormLabel from 'calypso/components/forms/form-label';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { emailManagement } from 'calypso/my-sites/email/paths';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { recordTracksEvent as recordTracksEventAction } from 'calypso/state/analytics/actions';
import { addItems } from 'calypso/lib/cart/actions';
import { titanMailMonthly } from 'calypso/lib/cart-values/cart-items';

/**
 * Style dependencies
 */
import './style.scss';

class TitanMailQuantitySelection extends React.Component {
	state = {
		quantity: 1,
	};

	recordClickEvent = ( eventName ) => {
		const { recordTracksEvent, selectedDomainName } = this.props;
		recordTracksEvent( eventName, {
			domain_name: selectedDomainName,
			quantity: this.state.quantity,
		} );
	};

	goToEmail = () => {
		page(
			emailManagement(
				this.props.selectedSite.slug,
				this.props.selectedDomainName,
				this.props.currentRoute
			)
		);
	};

	handleCancel = () => {
		this.recordClickEvent(
			'calypso_email_management_titan_quantity_selection_cancel_button_click'
		);
		this.goToEmail();
	};

	handleContinue = () => {
		const { selectedSite, selectedDomainName } = this.props;

		this.recordClickEvent(
			'calypso_email_management_titan_quantity_selection_continue_button_click'
		);

		addItems( [
			titanMailMonthly( { domain: selectedDomainName, quantity: this.state.quantity } ),
		] );
		page( '/checkout/' + selectedSite.slug );
	};

	onQuantityChange = ( e ) => {
		const parsedQuantity = parseInt( e.target.value, 10 );
		const quantity = isNaN( parsedQuantity ) ? 1 : Math.max( 1, parsedQuantity );

		if ( quantity.toString() !== e.target.value ) {
			e.target.value = quantity;
		}

		this.setState( { quantity } );
	};

	renderForm() {
		const { translate } = this.props;
		return (
			<>
				<SectionHeader label={ translate( 'Choose Quantity' ) } />

				<Card>
					<div>
						<FormLabel>{ translate( 'Number of new mailboxes to purchase' ) }</FormLabel>
						<FormTextInput
							name="quantity"
							type="number"
							min="1"
							placeholder={ translate( 'Number of new mailboxes' ) }
							value={ this.state.quantity }
							onChange={ this.onQuantityChange }
						/>
					</div>

					<hr className="titan-mail-quantity-selection__divider" />

					<div className="titan-mail-quantity-selection__buttons">
						<Button className="titan-mail-quantity-selection__cancel" onClick={ this.handleCancel }>
							{ translate( 'Cancel' ) }
						</Button>
						<Button primary onClick={ this.handleContinue }>
							{ translate( 'Continue' ) }
						</Button>
					</div>
				</Card>
			</>
		);
	}

	render() {
		const { selectedDomainName, translate } = this.props;
		return (
			<>
				<Main>
					<DomainManagementHeader
						onClick={ this.goToEmail }
						selectedDomainName={ selectedDomainName }
					>
						{ translate( 'Titan Mail' ) }
					</DomainManagementHeader>

					{ this.renderForm() }
				</Main>
			</>
		);
	}
}

export default connect(
	( state ) => {
		const selectedSite = getSelectedSite( state );
		return {
			currentRoute: getCurrentRoute( state ),
			selectedSite,
		};
	},
	{ recordTracksEvent: recordTracksEventAction }
)( localize( TitanMailQuantitySelection ) );
