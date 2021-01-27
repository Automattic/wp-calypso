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
import { getStripeConfiguration } from 'calypso/lib/store-transactions';
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
import { isEnabled } from '@automattic/calypso-config';

function AddNewPaymentMethod( props ) {
	const goToPaymentMethods = () => page( paymentMethods );
	const recordFormSubmitEvent = () => recordTracksEvent( 'calypso_add_credit_card_form_submit' );
	const addPaymentMethodTitle = isEnabled( 'purchases/new-payment-methods' )
		? titles.addPaymentMethod
		: titles.addCreditCard;

	return (
		<Main className="add-new-payment-method is-wide-layout">
			<PageViewTracker
				path={
					isEnabled( 'purchases/new-payment-methods' )
						? '/me/purchases/add-payment-method'
						: '/me/purchases/add-credit-card'
				}
				title={ concatTitle( titles.activeUpgrades, addPaymentMethodTitle ) }
			/>
			<DocumentHead title={ concatTitle( titles.activeUpgrades, addPaymentMethodTitle ) } />

			<FormattedHeader brandFont headerText={ titles.sectionTitle } align="left" />
			<HeaderCake onClick={ goToPaymentMethods }>{ addPaymentMethodTitle }</HeaderCake>

			<Layout>
				<Column type="main">
					<StripeHookProvider
						configurationArgs={ { needs_intent: true } }
						locale={ props.locale }
						fetchStripeConfiguration={ getStripeConfiguration }
					>
						<PaymentMethodForm
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
