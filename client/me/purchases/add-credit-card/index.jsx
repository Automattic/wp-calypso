/**
 * External dependencies
 */
import { curry } from 'lodash';
import page from 'page';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import CreditCardForm from 'blocks/credit-card-form';
import DocumentHead from 'components/data/document-head';
import HeaderCake from 'components/header-cake';
import Main from 'components/main';
import analytics from 'lib/analytics';
import { concatTitle } from 'lib/react-helpers';
import { createPaygateToken } from 'lib/store-transactions';
import purchasesPaths from 'me/purchases/paths';
import titles from 'me/purchases/titles';
import { addStoredCard } from 'state/stored-cards/actions';

class AddCreditCard extends Component {
	static propTypes = {
		addStoredCard: PropTypes.func.isRequired,
	};

	constructor( props ) {
		super( props );
		this.createPaygateToken = curry( createPaygateToken )( 'card_add' );
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
					createPaygateToken={ this.createPaygateToken }
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
