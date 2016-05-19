/**
 * External dependencies
 */
import i18n from 'i18n-calypso';

const options = {
	context: 'Title text'
};

export default {
	cancelPrivateRegistration: i18n.translate( 'Cancel Private Registration', options ),
	cancelPurchase: i18n.translate( 'Cancel Purchase', options ),
	confirmCancelDomain: i18n.translate( 'Cancel Domain', options ),
	editCardDetails: i18n.translate( 'Edit Card Details', Object.assign( {}, options, { comment: 'Credit card' } ) ),
	addCardDetails: i18n.translate( 'Add Card Details', Object.assign( {}, options, { comment: 'Credit card' } ) ),
	editPaymentMethod: i18n.translate( 'Edit Payment Method', options ),
	managePurchase: i18n.translate( 'Manage Purchase', options ),
	purchases: i18n.translate( 'Purchases', options )
};
