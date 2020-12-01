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
import PaymentMethodForm from 'calypso/me/purchases/components/payment-method-form';
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

function AddNewPaymentMethod( props ) {
	const createAddCardToken = ( ...args ) => createCardToken( 'card_add', ...args );
	const goToPaymentMethods = () => page( paymentMethods );
	const recordFormSubmitEvent = () => recordTracksEvent( 'calypso_add_credit_card_form_submit' );

	return (
		<Main className="add-new-payment-method is-wide-layout">
			<PageViewTracker
				path="/me/purchases/add-payment-method"
				title="Purchases > Add Payment Method"
			/>
			<DocumentHead title={ concatTitle( titles.purchases, titles.addPaymentMethod ) } />

			<FormattedHeader brandFont headerText={ titles.sectionTitle } align="left" />
			<HeaderCake onClick={ goToPaymentMethods }>{ titles.addPaymentMethod }</HeaderCake>

			<Layout>
				<Column type="main">
					<StripeHookProvider
						configurationArgs={ { needs_intent: true } }
						locale={ props.locale }
						fetchStripeConfiguration={ getStripeConfiguration }
					>
						<PaymentMethodForm
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

AddNewPaymentMethod.propTypes = {
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
)( AddNewPaymentMethod );
