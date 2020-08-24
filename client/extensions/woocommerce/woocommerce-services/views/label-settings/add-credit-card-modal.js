/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Dialog } from '@automattic/components';
import { closeAddCardDialog } from 'woocommerce/woocommerce-services/state/label-settings/actions';
import { getLabelSettingsForm } from 'woocommerce/woocommerce-services/state/label-settings/selectors';
import CreditCardForm from 'blocks/credit-card-form';
import { addStoredCard } from 'state/stored-cards/actions';
import { createCardToken } from 'lib/store-transactions';
import { recordTracksEvent } from 'lib/analytics/tracks';
import { StripeHookProvider } from 'lib/stripe';

function AddCardDialog( {
	siteId,
	isVisible,
	translate,
	closeAddCardDialog: closeDialog,
	addStoredCard: saveStoredCard,
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
			<StripeHookProvider configurationArgs={ { needs_intent: true } }>
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
};

const mapStateToProps = ( state, { siteId } ) => {
	const form = getLabelSettingsForm( state, siteId );
	return {
		isVisible: Boolean( form && form.addCardDialog ),
	};
};

const mapDispatchToProps = ( dispatch ) => {
	return bindActionCreators( { closeAddCardDialog, addStoredCard }, dispatch );
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( AddCardDialog ) );
