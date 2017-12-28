/** @format */

/**
 * External dependencies
 */

import { connect } from 'react-redux';
import { curry } from 'lodash';
import page from 'page';
import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import { addStoredCard } from 'client/state/stored-cards/actions';
import analytics from 'client/lib/analytics';
import { concatTitle } from 'client/lib/react-helpers';
import { createCardToken } from 'client/lib/store-transactions';
import CreditCardForm from 'client/blocks/credit-card-form';
import DocumentHead from 'client/components/data/document-head';
import HeaderCake from 'client/components/header-cake';
import Main from 'client/components/main';
import titles from 'client/me/purchases/titles';
import purchasesPaths from 'client/me/purchases/paths';

class AddCreditCard extends Component {
	static propTypes = {
		addStoredCard: PropTypes.func.isRequired,
	};

	constructor( props ) {
		super( props );
		this.createCardToken = curry( createCardToken )( 'card_add' );
	}

	goToBillingHistory() {
		page( purchasesPaths.billingHistory() );
	}

	recordFormSubmitEvent() {
		analytics.tracks.recordEvent( 'calypso_add_credit_card_form_submit' );
	}

	render() {
		return (
			<Main>
				<DocumentHead title={ concatTitle( titles.purchases, titles.addCreditCard ) } />

				<HeaderCake onClick={ this.goToBillingHistory }>{ titles.addCreditCard }</HeaderCake>

				<CreditCardForm
					createCardToken={ this.createCardToken }
					recordFormSubmitEvent={ this.recordFormSubmitEvent }
					saveStoredCard={ this.props.addStoredCard }
					successCallback={ this.goToBillingHistory }
					showUsedForExistingPurchasesInfo={ true }
				/>
			</Main>
		);
	}
}

const mapDispatchToProps = {
	addStoredCard,
};

export default connect( null, mapDispatchToProps )( AddCreditCard );
