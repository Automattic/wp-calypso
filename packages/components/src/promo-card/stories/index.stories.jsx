import PromoCard from '../';

export default {
	component: PromoCard,
	title: 'Promo Card',
};

const Template = ( args ) => <PromoCard { ...args } />;

export const Default = Template.bind( {} );
Default.args = {
	data: {
		isMobile: false,
	},
};

export const Mobile = Template.bind( {} );
Mobile.args = {
	data: {
		...Default.args.data,
		isMobile: true,
	},
	className: 'example-extra-classname',
};
