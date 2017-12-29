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
import { addStoredCard } from 'state/stored-cards/actions';
import analytics from 'lib/analytics';
import { concatTitle } from 'lib/react-helpers';
import { createCardToken } from 'lib/store-transactions';
import CreditCardForm from 'blocks/credit-card-form';
import DocumentHead from 'components/data/document-head';
import HeaderCake from 'components/header-cake';
import Main from 'components/main';
import titles from 'me/purchases/titles';
import { billingHistory } from 'me/purchases/paths';

class AddCreditCard extends Component {
	static propTypes = {
		addStoredCard: PropTypes.func.isRequired,
	};

	constructor( props ) {
		super( props );
		this.createCardToken = curry( createCardToken )( 'card_add' );
	}

	goToBillingHistory() {
		page( billingHistory );
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
