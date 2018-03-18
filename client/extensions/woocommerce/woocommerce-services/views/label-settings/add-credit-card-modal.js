/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { localize } from 'i18n-calypso';
import { curry } from 'lodash';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';
import HeaderCake from 'components/header-cake';
import { closeAddCardDialog } from 'woocommerce/woocommerce-services/state/label-settings/actions';
import { getLabelSettingsForm } from 'woocommerce/woocommerce-services/state/label-settings/selectors';
import CreditCardForm from 'blocks/credit-card-form';
import { addStoredCard } from 'state/stored-cards/actions';
import { createCardToken } from 'lib/store-transactions';
import analytics from 'lib/analytics';

class AddCardDialog extends Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
		isVisible: PropTypes.bool,
		addStoredCard: PropTypes.func.isRequired,
		closeAddCardDialog: PropTypes.func.isRequired,
	};

	constructor( props ) {
		super( props );
		this.createCardToken = curry( createCardToken )( 'card_add' );
	}

	recordFormSubmitEvent() {
		analytics.tracks.recordEvent( 'calypso_add_credit_card_form_submit' );
	}

	render() {
		const { siteId, isVisible, translate } = this.props;

		const onClose = () => this.props.closeAddCardDialog( siteId );

		return (
			<Dialog
				additionalClassNames="add-credit-card-modal woocommerce wcc-root"
				isVisible={ isVisible }
				onClose={ onClose }
				>
				<HeaderCake onClick={ onClose }>{ translate( 'Add Credit Card' ) }</HeaderCake>
				<CreditCardForm
					createCardToken={ this.createCardToken }
					recordFormSubmitEvent={ this.recordFormSubmitEvent }
					saveStoredCard={ this.props.addStoredCard }
					successCallback={ onClose }
					showUsedForExistingPurchasesInfo={ true }
				/>
			</Dialog>
		);
	}
}

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
