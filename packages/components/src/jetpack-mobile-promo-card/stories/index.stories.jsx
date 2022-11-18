import JetpackMobilePromoCard from '../';

export default {
	component: JetpackMobilePromoCard,
	title: 'Jetpack Mobile Promo Card',
};

const Template = ( args ) => <JetpackMobilePromoCard { ...args } />;

export const Default = Template.bind( {} );
Default.args = {
	className: 'jetpack-promo',
};

export const WooPromo = Template.bind( {} );
WooPromo.args = {
	className: 'woo-promo',
	isWoo: true,
};
