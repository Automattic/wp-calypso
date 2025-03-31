import i18n from 'i18n-calypso';

const titles = {
	addCreditCard: i18n.translate( 'Add Credit Card' ),
	addPaymentMethod: i18n.translate( 'Add Payment Method' ),
	cancelPurchase: i18n.translate( 'Cancel Purchase' ),
	confirmCancelDomain: i18n.translate( 'Cancel Domain' ),
	changePaymentMethod: i18n.translate( 'Change Payment Method' ),
	addCardDetails: i18n.translate( 'Add Credit Card' ),
	managePurchase: i18n.translate( 'Purchase Settings' ),
	downgradeSubscription: ( planTitle ) =>
		planTitle
			? i18n.translate( 'Downgrade your %(plan)s subscription', { args: { plan: planTitle } } )
			: i18n.translate( 'Downgrade your subscription' ),
	sectionTitle: i18n.translate( 'Purchases' ),
	myPlan: i18n.translate( 'My Plan' ),
	activeUpgrades: i18n.translate( 'Active Upgrades' ),
	billingHistory: i18n.translate( 'Billing History' ),
	paymentMethods: i18n.translate( 'Payment Methods' ),
};

/**
 * Define properties with translatable strings getters.
 */
Object.defineProperties( titles, {
	addCreditCard: {
		get: () => i18n.translate( 'Add Credit Card' ),
	},
	addPaymentMethod: {
		get: () => i18n.translate( 'Add Payment Method' ),
	},
	cancelPurchase: {
		get: () => i18n.translate( 'Cancel Purchase' ),
	},
	confirmCancelDomain: {
		get: () => i18n.translate( 'Cancel Domain' ),
	},
	changePaymentMethod: {
		get: () => i18n.translate( 'Change Payment Method' ),
	},
	addCardDetails: {
		get: () => i18n.translate( 'Add Credit Card' ),
	},
	managePurchase: {
		get: () => i18n.translate( 'Purchase Settings' ),
	},
	sectionTitle: {
		get: () => i18n.translate( 'Purchases' ),
	},
	activeUpgrades: {
		get: () => i18n.translate( 'Active Upgrades' ),
	},
	myPlan: {
		get: () => i18n.translate( 'My Plan' ),
	},
	billingHistory: {
		get: () => i18n.translate( 'Billing History' ),
	},
	paymentMethods: {
		get: () => i18n.translate( 'Payment Methods' ),
	},
} );

export default titles;
