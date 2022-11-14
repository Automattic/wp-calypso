import PromoCard from '../';

export default {
	component: PromoCard,
	title: 'Promo Card',
};

const Template = ( args ) => <PromoCard { ...args } />;

export const Default = Template.bind( {} );
Default.args = {
	isMobile: false,
};

export const Mobile = Template.bind( {} );
Mobile.args = {
	className: 'example-extra-classname',
	isMobile: true,
};
