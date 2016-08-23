/**
 * External dependencies
 */
import { connect } from 'react-redux';
import page from 'page';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import { concatTitle } from 'lib/react-helpers';
import CreditCardPage from 'me/purchases/components/credit-card-page';
import DocumentHead from 'components/data/document-head';
import HeaderCake from 'components/header-cake' ;
import Main from 'components/main';
import * as titles from 'me/payment-methods/titles';

class AddCreditCard extends Component {
	static propTypes = {
	};

	goToBillingHistory() {
		page( '/me/billing' );
	}

	recordFormSubmitEvent() {
		analytics.tracks.recordEvent( 'calypso_add_credit_card_form_submit' );
	}

	render() {
		return (
			<Main>
				<DocumentHead title={ concatTitle( titles.paymentMethods, titles.addCreditCard ) } />

				<HeaderCake onClick={ this.goToBillingHistory }>{ titles.addCreditCard }</HeaderCake>

				<CreditCardPage
					recordFormSubmitEvent={ this.recordFormSubmitEvent }
					successCallback={ this.goToBillingHistory } />
			</Main>
		);
	}
}

const mapDispatchToProps = {
};

export default connect( {}, mapDispatchToProps )( AddCreditCard );

export default AddCreditCard;
