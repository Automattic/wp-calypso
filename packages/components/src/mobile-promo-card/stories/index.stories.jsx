import MobilePromoCard from '../';

export default {
	component: MobilePromoCard,
	title: 'Mobile Promo Card',
};

const Template = ( args ) => <MobilePromoCard { ...args } />;

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
