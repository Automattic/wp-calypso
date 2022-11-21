import JetpackMobilePromoCard from '../';

export default {
	component: JetpackMobilePromoCard,
	title: 'Jetpack Mobile Promo Card',
};

const Template = ( args ) => <JetpackMobilePromoCard { ...args } />;

export const Default = Template.bind( {} );
Default.args = {
	isMobile: false,
};

export const Mobile = Template.bind( {} );
Mobile.args = {
	className: 'example-extra-classname',
	isMobile: true,
};
