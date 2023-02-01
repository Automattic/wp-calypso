import AppPromoFullWidth from '..';

export default {
	component: AppPromoFullWidth,
	title: 'Mobile Promo Card',
};

const Template = ( args ) => <AppPromoFullWidth { ...args } />;

export const Default = Template.bind( {} );
Default.args = {
	className: 'jetpack-promo',
	clickHandler: ( eventName ) => {
		// eslint-disable-next-line no-console
		console.log( 'click event! ' + eventName );
	},
};

export const WooPromo = Template.bind( {} );
WooPromo.args = {
	className: 'woo-promo',
	isWoo: true,
	clickHandler: ( eventName ) => {
		// eslint-disable-next-line no-console
		console.log( 'click event! ' + eventName );
	},
};
