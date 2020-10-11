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
import { addStoredCard } from 'calypso/state/stored-cards/actions';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { concatTitle } from 'calypso/lib/react-helpers';
import { createCardToken } from 'calypso/lib/store-transactions';
import CreditCardForm from 'calypso/blocks/credit-card-form';
import DocumentHead from 'calypso/components/data/document-head';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import titles from 'calypso/me/purchases/titles';
import { billingHistory } from 'calypso/me/purchases/paths';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { StripeHookProvider } from 'calypso/lib/stripe';

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
