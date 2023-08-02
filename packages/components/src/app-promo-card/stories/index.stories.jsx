import AppPromoCard from '..';

export default {
	component: AppPromoCard,
	title: 'packages/components/App Promo Card',
};

const Template = ( args ) => <AppPromoCard { ...args } />;

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
