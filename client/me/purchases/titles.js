/**
 * Internal dependencies
 */
import i18n from 'lib/mixins/i18n';

const options = {
	context: 'Title text'
};

export default {
	cancelPrivateRegistration: i18n.translate( 'Cancel Private Registration', options ),
	cancelPurchase: i18n.translate( 'Cancel Purchase', options ),
	confirmCancelPurchase: i18n.translate( 'Confirm Cancel Purchase', options ),
	editCardDetails: i18n.translate( 'Edit Card Details', Object.assign( {}, options, { comment: 'Credit card' } ) ),
	editPaymentMethod: i18n.translate( 'Edit Payment Method', options ),
	managePurchase: i18n.translate( 'Manage Purchase', options ),
	purchases: i18n.translate( 'Purchases', options )
};
