import PromoCard from '../';

export default {
	component: PromoCard,
	title: 'Promo Card',
};

const Template = ( args ) => <PromoCard { ...args } />;

export const Default = Template.bind( {} );
Default.args = {
	data: {
		title: 'Bring your stats with you using the Jetpack mobile app',
		message: 'Visit wp.com/app or scan the QR code to download the Jetpack mobile app.',
	},
};

export const Mobile = Template.bind( {} );
Mobile.args = {
	data: {
		...Default.args.data,
		message:
			'Check your stats on-the-go and get real-time notifications with the Jetpack mobile app.',
		cta: 'app-store',
	},
	className: 'example-extra-classname',
};
