/**
 * External dependencies
 */
import { connect } from 'react-redux';
import page from 'page';
import React from 'react';
import PropTypes from 'prop-types';
import { StripeHookProvider } from '@automattic/calypso-stripe';

/**
 * Internal dependencies
 */
import { addStoredCard } from 'calypso/state/stored-cards/actions';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { concatTitle } from 'calypso/lib/react-helpers';
import { createCardToken, getStripeConfiguration } from 'calypso/lib/store-transactions';
import CreditCardForm from 'calypso/blocks/credit-card-form';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import titles from 'calypso/me/purchases/titles';
import { paymentMethods } from 'calypso/me/purchases/paths';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import Layout from 'calypso/components/layout';
import Column from 'calypso/components/layout/column';
import PaymentMethodSidebar from 'calypso/me/purchases/components/payment-method-sidebar';

function AddCreditCard( props ) {
	const createAddCardToken = ( ...args ) => createCardToken( 'card_add', ...args );
	const goToPaymentMethods = () => page( paymentMethods );
	const recordFormSubmitEvent = () => recordTracksEvent( 'calypso_add_credit_card_form_submit' );

	return (
		<Main className="add-credit-card is-wide-layout">
			<PageViewTracker path="/me/purchases/add-credit-card" title="Purchases > Add Credit Card" />
			<DocumentHead title={ concatTitle( titles.purchases, titles.addCreditCard ) } />

			<FormattedHeader brandFont headerText={ titles.sectionTitle } align="left" />
			<HeaderCake onClick={ goToPaymentMethods }>{ titles.addCreditCard }</HeaderCake>

			<Layout>
				<Column type="main">
					<StripeHookProvider
						configurationArgs={ { needs_intent: true } }
						locale={ props.locale }
						fetchStripeConfiguration={ getStripeConfiguration }
					>
						<CreditCardForm
							createCardToken={ createAddCardToken }
							recordFormSubmitEvent={ recordFormSubmitEvent }
							saveStoredCard={ props.addStoredCard }
							successCallback={ goToPaymentMethods }
						/>
					</StripeHookProvider>
				</Column>
				<Column type="sidebar">
					<PaymentMethodSidebar />
				</Column>
			</Layout>
		</Main>
	);
}

AddCreditCard.propTypes = {
	addStoredCard: PropTypes.func.isRequired,
	locale: PropTypes.string,
};

const mapDispatchToProps = {
	addStoredCard,
};

export default connect(
	( state ) => ( {
		locale: getCurrentUserLocale( state ),
	} ),
	mapDispatchToProps
)( AddCreditCard );
