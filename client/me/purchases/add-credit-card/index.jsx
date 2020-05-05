/**
 * External dependencies
 */
import { connect } from 'react-redux';
import page from 'page';
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import { addStoredCard } from 'state/stored-cards/actions';
import { recordTracksEvent } from 'lib/analytics/tracks';
import { concatTitle } from 'lib/react-helpers';
import { createCardToken } from 'lib/store-transactions';
import CreditCardForm from 'blocks/credit-card-form';
import DocumentHead from 'components/data/document-head';
import HeaderCake from 'components/header-cake';
import Main from 'components/main';
import titles from 'me/purchases/titles';
import { billingHistory } from 'me/purchases/paths';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import { StripeHookProvider } from 'lib/stripe';

function AddCreditCard( props ) {
	const createAddCardToken = ( ...args ) => createCardToken( 'card_add', ...args );
	const goToBillingHistory = () => page( billingHistory );
	const recordFormSubmitEvent = () => recordTracksEvent( 'calypso_add_credit_card_form_submit' );

	return (
		<Main>
			<PageViewTracker path="/me/purchases/add-credit-card" title="Purchases > Add Credit Card" />
			<DocumentHead title={ concatTitle( titles.purchases, titles.addCreditCard ) } />

			<HeaderCake onClick={ goToBillingHistory }>{ titles.addCreditCard }</HeaderCake>
			<StripeHookProvider configurationArgs={ { needs_intent: true } }>
				<CreditCardForm
					createCardToken={ createAddCardToken }
					recordFormSubmitEvent={ recordFormSubmitEvent }
					saveStoredCard={ props.addStoredCard }
					successCallback={ goToBillingHistory }
					showUsedForExistingPurchasesInfo={ true }
				/>
			</StripeHookProvider>
		</Main>
	);
}

AddCreditCard.propTypes = {
	addStoredCard: PropTypes.func.isRequired,
};

const mapDispatchToProps = {
	addStoredCard,
};

export default connect( null, mapDispatchToProps )( AddCreditCard );
