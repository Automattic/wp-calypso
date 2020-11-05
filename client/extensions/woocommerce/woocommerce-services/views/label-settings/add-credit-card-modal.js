/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { localize } from 'i18n-calypso';
import { StripeHookProvider } from '@automattic/calypso-stripe';

/**
 * Internal dependencies
 */
import { Dialog } from '@automattic/components';
import { closeAddCardDialog } from 'woocommerce/woocommerce-services/state/label-settings/actions';
import { getLabelSettingsForm } from 'woocommerce/woocommerce-services/state/label-settings/selectors';
import CreditCardForm from 'calypso/blocks/credit-card-form';
import { addStoredCard } from 'calypso/state/stored-cards/actions';
import { createCardToken, getStripeConfiguration } from 'calypso/lib/store-transactions';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';

function AddCardDialog( {
	siteId,
	isVisible,
	translate,
	closeAddCardDialog: closeDialog,
	addStoredCard: saveStoredCard,
	locale,
} ) {
	const createCardAddToken = ( ...args ) => createCardToken( 'card_add', ...args );
	const recordFormSubmitEvent = () => recordTracksEvent( 'calypso_add_credit_card_form_submit' );
	const onClose = () => closeDialog( siteId );

	return (
		<Dialog
			additionalClassNames="add-credit-card-modal woocommerce wcc-root"
			isVisible={ isVisible }
			onClose={ onClose }
		>
			<StripeHookProvider
				locale={ locale }
				configurationArgs={ { needs_intent: true } }
				fetchStripeConfiguration={ getStripeConfiguration }
			>
				<CreditCardForm
					createCardToken={ createCardAddToken }
					recordFormSubmitEvent={ recordFormSubmitEvent }
					saveStoredCard={ saveStoredCard }
					successCallback={ onClose }
					showUsedForExistingPurchasesInfo={ true }
					heading={ translate( 'Add credit card' ) }
					onCancel={ onClose }
				/>
			</StripeHookProvider>
		</Dialog>
	);
}

AddCardDialog.propTypes = {
	siteId: PropTypes.number.isRequired,
	isVisible: PropTypes.bool,
	translate: PropTypes.func.isRequired,
	addStoredCard: PropTypes.func.isRequired,
	closeAddCardDialog: PropTypes.func.isRequired,
	locale: PropTypes.string,
};

const mapStateToProps = ( state, { siteId } ) => {
	const form = getLabelSettingsForm( state, siteId );
	return {
		isVisible: Boolean( form && form.addCardDialog ),
		locale: getCurrentUserLocale( state ),
	};
};

const mapDispatchToProps = ( dispatch ) => {
	return bindActionCreators( { closeAddCardDialog, addStoredCard }, dispatch );
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( AddCardDialog ) );
