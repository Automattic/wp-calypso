/**
 * External Dependencies
 */
import { connect } from 'react-redux';

/**
 * Internal Dependencies
 */
import { clearPurchases } from 'state/purchases/actions';
import CreditCardPage from 'me/purchases/components/credit-card-page';
import { getByPurchaseId, hasLoadedUserPurchasesFromServer } from 'state/purchases/selectors';
import { getSelectedSite as getSelectedSiteSelector } from 'state/ui/selectors';
import { getStoredCardById, hasLoadedStoredCardsFromServer } from 'state/stored-cards/selectors';
import { isRenewing } from 'lib/purchases';
import { isRequestingSites } from 'state/sites/selectors';
import { addCardDetails, editCardDetails } from 'me/purchases/titles';

const mapStateToProps = ( state, props ) => {
	const selectedPurchase = getByPurchaseId( state, props.purchaseId );

	return {
		card: getStoredCardById( state, props.cardId ),
		hasLoadedSites: ! isRequestingSites( state ),
		hasLoadedStoredCardsFromServer: hasLoadedStoredCardsFromServer( state ),
		hasLoadedUserPurchasesFromServer: hasLoadedUserPurchasesFromServer( state ),
		selectedPurchase,
		selectedSite: getSelectedSiteSelector( state ),
		title: selectedPurchase && isRenewing( selectedPurchase ) ? editCardDetails : addCardDetails
	};
};

const mapDispatchToProps = {
	clearPurchases
};

export default connect( mapStateToProps, mapDispatchToProps )( CreditCardPage );
